import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from 'src/core/prisma/prisma.service'; // Перевір шлях до PrismaService

@Controller('v1/payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService, // ДОДАЛИ ЦЕ
  ) {}

  @Post('subscribe')
  // Тут має бути твій Guard для авторизації, щоб отримати user
  async subscribe(@Body() body: { plan: any; userId: string; tenantId: string }) {
    // Викликаємо метод, який ми реально написали в сервісі
    return this.paymentService.createSubscription(
      body.userId,
      body.tenantId,
      body.plan,
    );
  }

  @Post('callback')
  async handleCallback(@Body() data: any) {
    // Валідуємо підпис (метод додамо в сервіс нижче)
    const isValid = this.paymentService.validateSignature(data);
    if (!isValid) return { response: 'error', message: 'Invalid signature' };

    if (data.transactionStatus === 'Approved') {
      const [prefix, plan, tenantId, userId] = data.orderReference.split('_');

      if (prefix === 'SUB') {
        await this.prisma.$transaction([
          this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan: plan as any,
              subscriptionStatus: 'ACTIVE',
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }),
          this.prisma.paymentHistory.create({
            data: {
              tenantId,
              userId,
              amount: Number(data.amount),
              plan: plan as any,
              externalId: data.transactionId,
            },
          }),
        ]);
      }
    }

    return { response: 'accept' };
  }
}