// dto/create-payment.dto.ts
export class CreatePaymentDto {
  orderId!: string;
  amount!: number;
  description!: string;
}

// dto/fondy-callback.dto.ts
export class FondyCallbackDto {
  order_id!: string;
  amount!: string;
  currency!: string;
  order_status!: 'created' | 'processing' | 'declined' | 'approved' | 'expired' | 'reversed';
  response_status!: string;
  signature!: string;
  merchant_id!: number;
  [key: string]: any;
}