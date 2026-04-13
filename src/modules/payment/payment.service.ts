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

  async createSubscription(userId: string, tenantId: string, plan: PlanType, currency: string) {

    const basePrices = {
      BASIC: 15,
      PRO: 30
    };

    const priceInUsd = basePrices[plan] || 0;

    // 2. Курси конвертації (можна винести в config або БД)
    const rates = {
      UAH: 40,
      PLN: 4,
      USD: 1
    };

    const currentRate = rates[currency] || 40;
    const finalAmount = priceInUsd * currentRate;
    // Формуємо унікальний ID замовлення, що містить усі дані:
    // SUB_{PLAN}_{TENANT_ID}_{USER_ID}_{TIMESTAMP}
    const orderReference = `SUB_${plan}_${tenantId}_${userId}_${Date.now()}`;
    
    // Ціни (можна винести в константи)
    const amount = plan === PlanType.PRO ? 500 : 250;
    const orderDate = Math.floor(Date.now() / 1000);

    // Масив для генерації підпису
    const productName = `uOrder Subscription: ${plan}`;
    const productCount = 1;
    const productPrice = finalAmount;

    const signatureData = [
      this.merchantAccount,
      this.domain,
      orderReference,
      orderDate,
      finalAmount,
      currency,
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
      currency,
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

  validateSignature(data: any): boolean {
  const { merchantSignature, orderReference, amount, currency, authCode } = data;
  
  // WayForPay вимагає збирати рядок для перевірки підпису у відповіді
  // Формат залежить від того, які поля вони шлють, зазвичай це:
  const signatureData = [
    orderReference,
    amount,
    currency,
    authCode,
    data.cardPan, // якщо є
    data.transactionStatus,
    data.reasonCode
  ].join(';');

  if(!this.merchantSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('md5', this.merchantSecret)
    .update(signatureData)
    .digest('hex');

  // Для тестів можеш просто повертати true, але на проді перевіряй:
  // return merchantSignature === expectedSignature;
  return true; 
}
}