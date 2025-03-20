declare module 'midtrans-client' {
  export class Snap {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    createTransaction(parameter: {
      transaction_details: {
        order_id: string;
        gross_amount: number;
      };
      customer_details: {
        first_name: string;
        email: string;
        phone: string;
      };
      item_details: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
      }>;
    }): Promise<string>;

    transaction: {
      notification(notification: any): Promise<{
        order_id: string;
        transaction_status: string;
        payment_type: string;
      }>;
    };
  }
} 