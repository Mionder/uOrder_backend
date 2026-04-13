// src/modules/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export enum PlanType {
  BASIC = 'BASIC',
  PRO = 'PRO',
}

@Injectable()
export class PaymentService {
  private readonly merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
  private readonly merchantSecret = process.env.WAYFORPAY_MERCHANT_SECRET;
  private readonly domain = process.env.WAYFORPAY_DOMAIN;

  async createSubscription(userId: string, tenantId: string, plan: PlanType) {
    // Формуємо унікальний ID замовлення, що містить усі дані:
    // SUB_{PLAN}_{TENANT_ID}_{USER_ID}_{TIMESTAMP}
    const orderReference = `SUB_${plan}_${tenantId}_${userId}_${Date.now()}`;
    
    // Ціни (можна винести в константи)
    const amount = plan === PlanType.PRO ? 500 : 250;
    const orderDate = Math.floor(Date.now() / 1000);

    // Масив для генерації підпису
    const productName = `uOrder Subscription: ${plan}`;
    const productCount = 1;
    const productPrice = amount;

    const signatureData = [
      this.merchantAccount,
      this.domain,
      orderReference,
      orderDate,
      amount,
      'UAH',
      productName,
      productCount,
      productPrice,
    ].join(';');

    if (!this.merchantSecret) {
      return null;
    }

    const signature = crypto
      .createHmac('md5', this.merchantSecret)
      .update(signatureData)
      .digest('hex');

    return {
      merchantAccount: this.merchantAccount,
      merchantDomainName: this.domain,
      merchantSignature: signature,
      orderReference,
      orderDate,
      amount,
      currency: 'UAH',
      productName: [productName],
      productCount: [productCount],
      productPrice: [productPrice],
      // Параметри рекурентності (підписки)
      regularMode: 'monthly',
      regularAmount: amount,
      regularOn: 'on',
      serviceUrl: `${process.env.API_URL}/v1/payments/callback`,
      returnUrl: `${process.env.FRONTEND_URL}/admin/billing/success`,
    };
  }
}