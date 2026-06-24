import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DemoLLMProvider, MockPaymentProvider, MockTelephonyProvider, OpenRouterAdapter } from './mock-providers';

@Injectable()
export class ProviderRegistry {
  readonly telephony = new MockTelephonyProvider();
  readonly llm = new DemoLLMProvider();
  readonly openRouter: OpenRouterAdapter;
  readonly payment = new MockPaymentProvider();

  constructor(private readonly config: ConfigService) {
    this.openRouter = new OpenRouterAdapter(config);
  }

  // Swap these methods to return Exotel/Twilio/Plivo, OpenRouter/OpenAI/Gemini,
  // Razorpay/Cashfree/PhonePe adapters once real credentials are configured.
  getTelephony() {
    return this.telephony;
  }
  getLLM() {
    if (this.config.get<string>('LLM_PROVIDER') === 'openrouter') return this.openRouter;
    return this.llm;
  }
  getPayment() {
    return this.payment;
  }
}
