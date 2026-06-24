import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Campaign, Lead } from '@prisma/client';
import { ConversationTurn, LLMProvider, PaymentProvider, TelephonyProvider } from './interfaces';

@Injectable()
export class MockTelephonyProvider implements TelephonyProvider {
  async startCall(lead: Lead, campaign: Campaign) {
    return { providerCallId: `mock-call-${campaign.id}-${lead.id}-${Date.now()}`, status: 'in_progress' };
  }
  async endCall() {}
  async getCallStatus() {
    return 'completed';
  }
  async sendDTMF() {}
  async recordCall(callId: string) {
    return { recordingUrl: `https://storage.example.local/recordings/${callId}.mp3` };
  }
}

export class ExotelAdapter extends MockTelephonyProvider {}
export class TwilioAdapter extends MockTelephonyProvider {}
export class PlivoAdapter extends MockTelephonyProvider {}

@Injectable()
export class DemoLLMProvider implements LLMProvider {
  async generateResponse(context: Record<string, unknown>) {
    const profile = context.businessProfile as any;
    return `Namaste, main ${profile?.businessName || 'business'} ki AI calling assistant bol rahi hoon. Aapki consented inquiry ke baare mein call kar rahi hoon.`;
  }
  async summarizeCall(transcript: ConversationTurn[]) {
    return transcript.map((t) => `${t.speaker}: ${t.text}`).join(' ').slice(0, 1000);
  }
  async classifyOutcome(transcript: ConversationTurn[]) {
    const text = transcript.map((t) => t.text.toLowerCase()).join(' ');
    if (/(stop|do not call|mat call|dnd|unsubscribe)/.test(text)) return 'do_not_call';
    if (/(pay|payment|link|upi|bhejo|send)/.test(text)) return 'payment_link_sent';
    if (/(callback|baad mein|kal|tomorrow)/.test(text)) return 'interested_callback';
    if (/(not interested|nahi chahiye|no)/.test(text)) return 'not_interested';
    return 'converted';
  }
  async extractPaymentIntent(transcript: ConversationTurn[]) {
    const text = transcript.map((t) => t.text.toLowerCase()).join(' ');
    return { wantsToPay: /(pay|payment|link|upi|buy|book)/.test(text), amountPaise: 99900 };
  }
  async detectCallbackRequest(transcript: ConversationTurn[]) {
    const text = transcript.map((t) => t.text.toLowerCase()).join(' ');
    return { requested: /(callback|baad mein|tomorrow|kal)/.test(text) };
  }
}

export class OpenAIRealtimeAdapter extends DemoLLMProvider {}
export class GeminiAdapter extends DemoLLMProvider {}
export class ClaudeAdapter extends DemoLLMProvider {}
export class LocalModelAdapter extends DemoLLMProvider {}

export class OpenRouterAdapter extends DemoLLMProvider {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async generateResponse(context: Record<string, unknown>) {
    if (!this.config.get<string>('OPENROUTER_API_KEY')) return super.generateResponse(context);
    const profile = context.businessProfile as any;
    const lead = context.lead as any;
    return (
      (await this.chat([
      {
        role: 'system',
        content:
          'You are a consent-based AI sales calling assistant for Indian businesses. Disclose that you are an AI assistant where required, be polite, respect opt-out immediately, and never pressure the customer.',
      },
      {
        role: 'user',
        content: `Business: ${profile?.businessName}. Industry: ${profile?.industry}. Lead: ${lead?.name}. Objective: greet, confirm name, explain the consented reason for call, and ask one helpful qualifying question.`,
      },
    ])) || super.generateResponse(context)
    );
  }

  async summarizeCall(transcript: ConversationTurn[]) {
    if (!this.config.get<string>('OPENROUTER_API_KEY')) return super.summarizeCall(transcript);
    return (
      (await this.chat([
      { role: 'system', content: 'Summarize this sales call in under 120 words with outcome, objections, callback, payment intent, and compliance notes.' },
      { role: 'user', content: JSON.stringify(transcript) },
    ])) || super.summarizeCall(transcript)
    );
  }

  async classifyOutcome(transcript: ConversationTurn[]) {
    if (!this.config.get<string>('OPENROUTER_API_KEY')) return super.classifyOutcome(transcript);
    const result = await this.chat([
      {
        role: 'system',
        content:
          'Return exactly one enum: converted, payment_link_sent, payment_completed, interested_callback, not_interested, wrong_number, no_answer, busy, do_not_call, failed.',
      },
      { role: 'user', content: JSON.stringify(transcript) },
    ]);
    const allowed = [
      'converted',
      'payment_link_sent',
      'payment_completed',
      'interested_callback',
      'not_interested',
      'wrong_number',
      'no_answer',
      'busy',
      'do_not_call',
      'failed',
    ];
    return allowed.find((x) => result.includes(x)) || super.classifyOutcome(transcript);
  }

  private async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
    const key = this.config.get<string>('OPENROUTER_API_KEY');
    if (!key) return '';
    const baseUrl = this.config.get<string>('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1';
    const model = this.config.get<string>('OPENROUTER_MODEL') || 'nvidia/nemotron-3-ultra-550b-a55b:free';
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.config.get<string>('WEB_ORIGIN') || 'http://localhost:3000',
        'X-Title': 'AI Sales Calling Agent',
      },
      body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 420 }),
    });
    if (!res.ok) return '';
    const json = (await res.json()) as any;
    return String(json?.choices?.[0]?.message?.content || '').trim();
  }
}

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async createPaymentLink(amountPaise: number, customer: { name: string; phone: string }, description: string) {
    const amount = (amountPaise / 100).toFixed(2);
    const note = encodeURIComponent(description);
    const name = encodeURIComponent(customer.name || 'Customer');
    return {
      providerPaymentId: `mock-pay-${Date.now()}`,
      paymentLink: `upi://pay?pa=demo-merchant@upi&pn=${name}&am=${amount}&cu=INR&tn=${note}`,
    };
  }
  async verifyWebhook() {
    return true;
  }
  async getPaymentStatus() {
    return 'created';
  }
}

export class RazorpayAdapter extends MockPaymentProvider {}
export class CashfreeAdapter extends MockPaymentProvider {}
export class PhonePeAdapter extends MockPaymentProvider {}
