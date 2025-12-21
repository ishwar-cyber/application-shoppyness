declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank';
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeOptions): Promise<void>;
  }

  export function load(mode?: {
    mode: 'sandbox' | 'production';
  }): Promise<CashfreeInstance>;
}
