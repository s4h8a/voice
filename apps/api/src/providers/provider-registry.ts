import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseLLMProvider, CashfreeAdapter, DisabledPaymentProvider, ExotelAdapter, OpenRouterAdapter, PhonePeAdapter, PlivoAdapter, RazorpayAdapter, TwilioAdapter } from './provider-adapters';
import { LLMProvider, PaymentProvider, TelephonyProvider } from './interfaces';

@Injectable()
export class ProviderRegistry {
  readonly exotel: ExotelAdapter;
  readonly twilio: TwilioAdapter;
  readonly plivo: PlivoAdapter;
  readonly llm = new BaseLLMProvider();
  readonly openRouter: OpenRouterAdapter;
  readonly razorpay: RazorpayAdapter;
  readonly cashfree = new CashfreeAdapter();
  readonly phonepe = new PhonePeAdapter();
  readonly disabledPayment = new DisabledPaymentProvider();

  constructor(private readonly config: ConfigService) {
    this.openRouter = new OpenRouterAdapter(config);
    this.exotel = new ExotelAdapter(config);
    this.twilio = new TwilioAdapter(config);
    this.plivo = new PlivoAdapter(config);
    this.razorpay = new RazorpayAdapter(config);
  }

  getTelephony(): TelephonyProvider {
    const provider = this.getTelephonyName();
    if (provider === 'exotel') return this.exotel;
    if (provider === 'twilio') return this.twilio;
    if (provider === 'plivo') return this.plivo;
    throw new BadRequestException(`Unsupported TELEPHONY_PROVIDER: ${provider}. Use exotel, twilio, or plivo.`);
  }
  getTelephonyName() {
    return (this.config.get<string>('TELEPHONY_PROVIDER') || 'exotel').toLowerCase();
  }
  getLLM(): LLMProvider {
    if (this.config.get<string>('LLM_PROVIDER') === 'openrouter') return this.openRouter;
    throw new BadRequestException('LLM_PROVIDER must be openrouter in real mode');
  }
  getPayment(): PaymentProvider {
    if (this.config.get<string>('BILLING_MODE') !== 'wallet') return this.disabledPayment;
    const provider = (this.config.get<string>('PAYMENT_PROVIDER') || 'razorpay').toLowerCase();
    if (provider === 'razorpay') return this.razorpay;
    if (provider === 'cashfree') return this.cashfree;
    if (provider === 'phonepe') return this.phonepe;
    throw new BadRequestException(`Unsupported PAYMENT_PROVIDER: ${provider}. Use razorpay, cashfree, or phonepe.`);
  }
  getPaymentName() {
    return this.config.get<string>('BILLING_MODE') !== 'wallet'
      ? 'disabled'
      : (this.config.get<string>('PAYMENT_PROVIDER') || 'razorpay').toLowerCase();
  }
}
