// payment.controller.ts
import { Controller, Post, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './create-payment.dto';
import { FondyCallbackDto } from './create-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

@Post('callback')
async handleCallback(@Body() data: any) {
  const { orderReference, transactionStatus, merchantSignature } = data;

  // 1. ВАЛІДАЦІЯ ПІДПИСУ (обов'язково для безпеки)
  // WayForPay шле свій підпис, ми маємо його перевірити, щоб ніхто не "накрутив" підписку
  // (Логіку валідації підпису краще винести в окремий метод сервісу)

  if (transactionStatus === 'Approved') {
    // Розбираємо наш хитрий orderReference
    // Нагадаю формат: SUB_{PLAN}_{TENANT_ID}_{USER_ID}_{TIMESTAMP}
    const [prefix, plan, tenantId, userId] = orderReference.split('_');

    if (prefix === 'SUB') {
      await this.prisma.$transaction([
        // Оновлюємо тариф ресторану
        this.prisma.tenant.update({
          where: { id: tenantId },
          data: { 
            plan: plan as any,
            subscriptionStatus: 'ACTIVE',
            lastPaymentDate: new Date(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        }),
        // Можна також залогувати платіж в окрему таблицю для історії
        this.prisma.paymentHistory.create({
          data: {
            tenantId,
            userId,
            amount: data.amount,
            plan: plan as any,
            externalId: data.transactionId
          }
        })
      ]);
    }
  }

  // Обов'язкова відповідь для WayForPay
  return { response: 'accept' };
}

  @Post('create')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPaymentLink(
      createPaymentDto.orderId,
      createPaymentDto.amount,
      createPaymentDto.description,
    );
  }

  @Post('webhook')
  @HttpCode(200) // Fondy очікує 200 OK
  async handleWebhook(@Body() callbackDto: FondyCallbackDto) {
    // 1. Перевіряємо підпис, щоб ніхто не підробив статус
    const isValid = this.paymentService.validateWebhook(callbackDto);
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    // 2. Оновлюємо статус в БД (тут ти викликаєш свій OrdersService)
    if (callbackDto.order_status === 'approved') {
      console.log(`Order ${callbackDto.order_id} PAID SUCCESSFULLY`);
      // updateOrderStatus(callbackDto.order_id, 'PAID')
    }

    return { status: 'ok' };
  }
}