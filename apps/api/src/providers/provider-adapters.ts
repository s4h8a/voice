import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Campaign, Lead } from '@prisma/client';
import { createHmac } from 'crypto';
import { ConversationTurn, LLMProvider, PaymentProvider, TelephonyProvider } from './interfaces';

function requireEnv(config: ConfigService, key: string) {
  const value = config.get<string>(key);
  if (!value) throw new BadRequestException(`${key} is required for the selected provider`);
  return value;
}

function basicAuth(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function toE164India(phone: string) {
  const raw = String(phone || '').trim();
  if (raw.startsWith('+')) return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export class ExotelAdapter implements TelephonyProvider {
  constructor(private readonly config: ConfigService) {}

  async startCall(lead: Lead, campaign: Campaign) {
    const sid = requireEnv(this.config, 'EXOTEL_ACCOUNT_SID');
    const apiKey = requireEnv(this.config, 'EXOTEL_API_KEY');
    const apiToken = requireEnv(this.config, 'EXOTEL_API_TOKEN');
    const callerId = this.config.get<string>('EXOTEL_CALLER_ID');
    const region = (this.config.get<string>('EXOTEL_REGION') || 'mumbai').toLowerCase();
    const host = region === 'singapore' ? 'api.exotel.com' : 'api.in.exotel.com';
    const url = `https://${host}/v1/Accounts/${sid}/Calls/connect`;
    const params = new URLSearchParams();
    const flowUrl = this.config.get<string>('EXOTEL_FLOW_URL') || buildExotelFlowUrl(sid, this.config.get<string>('EXOTEL_APP_ID'));

    if (flowUrl) {
      params.set('From', toE164India(lead.phone));
      if (callerId) params.set('CallerId', callerId);
      params.set('Url', flowUrl);
      params.set('CallType', 'trans');
    } else {
      const agentNumber = this.config.get<string>('EXOTEL_AGENT_NUMBER') || (campaign as any).businessProfile?.humanHandoffNumber;
      if (!agentNumber) throw new BadRequestException('EXOTEL_FLOW_URL or EXOTEL_AGENT_NUMBER is required for real Exotel calls');
      params.set('From', toE164India(agentNumber));
      params.set('To', toE164India(lead.phone));
      if (callerId) params.set('CallerId', callerId);
      params.set('CallType', 'trans');
    }

    params.set('Record', this.config.get<string>('EXOTEL_RECORD') || 'true');
    const statusCallback = this.config.get<string>('EXOTEL_STATUS_CALLBACK_URL') || callbackUrl(this.config, '/api/telephony/exotel/status');
    if (statusCallback) params.set('StatusCallback', statusCallback);

    const data = await postForm(url, params, basicAuth(apiKey, apiToken));
    const call = data?.Call || data;
    return { providerCallId: String(call?.Sid || call?.CallSid || ''), status: normalizeCallStatus(call?.Status || 'queued') };
  }

  async endCall() {}

  async getCallStatus(callId: string) {
    const sid = requireEnv(this.config, 'EXOTEL_ACCOUNT_SID');
    const apiKey = requireEnv(this.config, 'EXOTEL_API_KEY');
    const apiToken = requireEnv(this.config, 'EXOTEL_API_TOKEN');
    const region = (this.config.get<string>('EXOTEL_REGION') || 'mumbai').toLowerCase();
    const host = region === 'singapore' ? 'api.exotel.com' : 'api.in.exotel.com';
    const data = await getJson(`https://${host}/v1/Accounts/${sid}/Calls/${callId}`, basicAuth(apiKey, apiToken));
    return normalizeCallStatus(data?.Call?.Status || data?.Status || 'queued');
  }

  async sendDTMF() {}

  async recordCall(callId: string) {
    return { recordingUrl: `provider://exotel/${callId}/recording` };
  }
}

export class TwilioAdapter implements TelephonyProvider {
  constructor(private readonly config: ConfigService) {}

  async startCall(lead: Lead) {
    const accountSid = requireEnv(this.config, 'TWILIO_ACCOUNT_SID');
    const authToken = requireEnv(this.config, 'TWILIO_AUTH_TOKEN');
    const from = requireEnv(this.config, 'TWILIO_FROM_NUMBER');
    const params = new URLSearchParams({
      To: toE164India(lead.phone),
      From: from,
    });
    const twimlUrl = this.config.get<string>('TWILIO_TWIML_URL');
    if (twimlUrl) {
      params.set('Url', twimlUrl);
    } else {
      params.set(
        'Twiml',
        '<Response><Say voice="alice" language="en-IN">Hello. This is an AI calling assistant. Thank you for testing the sales calling platform.</Say></Response>',
      );
    }
    if (this.config.get<string>('TWILIO_RECORD') === 'true') params.set('Record', 'true');
    const data = await postForm(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, params, basicAuth(accountSid, authToken));
    return { providerCallId: String(data?.sid || ''), status: normalizeCallStatus(data?.status || 'queued') };
  }

  async endCall(callId: string) {
    const accountSid = requireEnv(this.config, 'TWILIO_ACCOUNT_SID');
    const authToken = requireEnv(this.config, 'TWILIO_AUTH_TOKEN');
    await postForm(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callId}.json`,
      new URLSearchParams({ Status: 'completed' }),
      basicAuth(accountSid, authToken),
    );
  }

  async getCallStatus(callId: string) {
    const accountSid = requireEnv(this.config, 'TWILIO_ACCOUNT_SID');
    const authToken = requireEnv(this.config, 'TWILIO_AUTH_TOKEN');
    const data = await getJson(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callId}.json`, basicAuth(accountSid, authToken));
    return normalizeCallStatus(data?.status || 'queued');
  }

  async sendDTMF() {}

  async recordCall(callId: string) {
    return { recordingUrl: `provider://twilio/${callId}/recording` };
  }
}

export class PlivoAdapter implements TelephonyProvider {
  constructor(private readonly config: ConfigService) {}

  async startCall(lead: Lead) {
    const authId = requireEnv(this.config, 'PLIVO_AUTH_ID');
    const authToken = requireEnv(this.config, 'PLIVO_AUTH_TOKEN');
    const from = requireEnv(this.config, 'PLIVO_FROM_NUMBER');
    const answerUrl = this.config.get<string>('PLIVO_ANSWER_URL') || callbackUrl(this.config, '/api/telephony/plivo/answer');
    if (!answerUrl) throw new BadRequestException('PLIVO_ANSWER_URL or PUBLIC_API_BASE_URL is required for Plivo calls');
    const data = await postJson(
      `https://api.plivo.com/v1/Account/${authId}/Call/`,
      {
        from,
        to: toE164India(lead.phone),
        answer_url: answerUrl,
        answer_method: 'GET',
      },
      basicAuth(authId, authToken),
    );
    return { providerCallId: String(data?.request_uuid || data?.call_uuid || ''), status: normalizeCallStatus(data?.status || 'queued') };
  }

  async endCall() {}

  async getCallStatus() {
    return 'queued';
  }

  async sendDTMF() {}

  async recordCall(callId: string) {
    return { recordingUrl: `provider://plivo/${callId}/recording` };
  }
}

@Injectable()
export class BaseLLMProvider implements LLMProvider {
  async generateResponse(context: Record<string, unknown>) {
    const profile = context.businessProfile as any;
    return `Namaste, main ${profile?.businessName || 'business'} ki AI calling assistant bol rahi hoon. Aapki consented inquiry ke baare mein call kar rahi hoon.`;
  }
  async summarizeCall(transcript: ConversationTurn[]) {
    return transcript.map((t) => `${t.speaker}: ${t.text}`).join(' ').slice(0, 1000);
  }
  async classifyOutcome(transcript: ConversationTurn[]): Promise<string> {
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

export class OpenAIRealtimeAdapter extends BaseLLMProvider {}
export class GeminiAdapter extends BaseLLMProvider {}
export class ClaudeAdapter extends BaseLLMProvider {}
export class LocalModelAdapter extends BaseLLMProvider {}

export class OpenRouterAdapter extends BaseLLMProvider {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async generateResponse(context: Record<string, unknown>) {
    requireEnv(this.config, 'OPENROUTER_API_KEY');
    const profile = context.businessProfile as any;
    const lead = context.lead as any;
    return (
      await this.chat([
      {
        role: 'system',
        content:
          'You are a consent-based AI sales calling assistant for Indian businesses. Disclose that you are an AI assistant where required, be polite, respect opt-out immediately, and never pressure the customer.',
      },
      {
        role: 'user',
        content: `Business: ${profile?.businessName}. Industry: ${profile?.industry}. Lead: ${lead?.name}. Objective: greet, confirm name, explain the consented reason for call, and ask one helpful qualifying question.`,
      },
    ])
    );
  }

  async summarizeCall(transcript: ConversationTurn[]) {
    requireEnv(this.config, 'OPENROUTER_API_KEY');
    return (
      await this.chat([
      { role: 'system', content: 'Summarize this sales call in under 120 words with outcome, objections, callback, payment intent, and compliance notes.' },
      { role: 'user', content: JSON.stringify(transcript) },
    ])
    );
  }

  async classifyOutcome(transcript: ConversationTurn[]) {
    requireEnv(this.config, 'OPENROUTER_API_KEY');
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
    const outcome = allowed.find((x) => result.includes(x));
    if (!outcome) throw new BadGatewayException(`OpenRouter returned invalid outcome: ${result}`);
    return outcome;
  }

  private async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
    const key = this.config.get<string>('OPENROUTER_API_KEY');
    if (!key) throw new BadRequestException('OPENROUTER_API_KEY is required');
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
    if (!res.ok) throw new BadGatewayException(`OpenRouter error ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as any;
    return String(json?.choices?.[0]?.message?.content || '').trim();
  }
}

export class RazorpayAdapter implements PaymentProvider {
  constructor(private readonly config: ConfigService) {}

  async createPaymentLink(amountPaise: number, customer: { name: string; phone: string; email?: string }, description: string) {
    const keyId = requireEnv(this.config, 'RAZORPAY_KEY_ID');
    const keySecret = requireEnv(this.config, 'RAZORPAY_KEY_SECRET');
    const data = await postJson(
      'https://api.razorpay.com/v1/payment_links/',
      {
        amount: amountPaise,
        currency: 'INR',
        accept_partial: false,
        reference_id: `aspa_${Date.now()}`,
        description,
        customer: { name: customer.name, contact: customer.phone, email: customer.email },
        notify: { sms: true, email: Boolean(customer.email) },
        reminder_enable: true,
      },
      basicAuth(keyId, keySecret),
    );
    return { providerPaymentId: String(data.id), paymentLink: String(data.short_url) };
  }

  async verifyWebhook(payload: unknown, signature?: string) {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) return Boolean(signature);
    if (!signature) return false;
    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return expected === signature;
  }

  async getPaymentStatus(paymentId: string) {
    const keyId = requireEnv(this.config, 'RAZORPAY_KEY_ID');
    const keySecret = requireEnv(this.config, 'RAZORPAY_KEY_SECRET');
    const data = await getJson(`https://api.razorpay.com/v1/payment_links/${paymentId}`, basicAuth(keyId, keySecret));
    return String(data.status || 'created');
  }
}

export class CashfreeAdapter implements PaymentProvider {
  async createPaymentLink(): Promise<{ providerPaymentId: string; paymentLink: string }> {
    throw new BadRequestException('Cashfree live adapter is not configured. Use PAYMENT_PROVIDER=razorpay or add Cashfree checkout configuration.');
  }
  async verifyWebhook() {
    return false;
  }
  async getPaymentStatus() {
    return 'failed';
  }
}

export class PhonePeAdapter implements PaymentProvider {
  async createPaymentLink(): Promise<{ providerPaymentId: string; paymentLink: string }> {
    throw new BadRequestException('PhonePe live adapter is not configured. Use PAYMENT_PROVIDER=razorpay or add PhonePe merchant checkout configuration.');
  }
  async verifyWebhook() {
    return false;
  }
  async getPaymentStatus() {
    return 'failed';
  }
}

export class DisabledPaymentProvider implements PaymentProvider {
  async createPaymentLink(): Promise<{ providerPaymentId: string; paymentLink: string }> {
    throw new BadRequestException('Payments are disabled while BILLING_MODE=free. Enable wallet billing before creating payment links.');
  }
  async verifyWebhook() {
    return false;
  }
  async getPaymentStatus() {
    return 'disabled';
  }
}

function buildExotelFlowUrl(sid: string, appId?: string) {
  return appId ? `http://my.exotel.com/${sid}/exoml/start_voice/${appId}` : undefined;
}

function callbackUrl(config: ConfigService, path: string) {
  const base = config.get<string>('PUBLIC_API_BASE_URL');
  return base ? `${base.replace(/\/$/, '')}${path}` : undefined;
}

function normalizeCallStatus(status: string) {
  return String(status || 'queued').replace('-', '_');
}

async function postForm(url: string, body: URLSearchParams, authorization: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  return parseProviderResponse(res);
}

async function postJson(url: string, body: Record<string, unknown>, authorization: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseProviderResponse(res);
}

async function getJson(url: string, authorization: string) {
  const res = await fetch(url, { headers: { Authorization: authorization } });
  return parseProviderResponse(res);
}

async function parseProviderResponse(res: Response) {
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new BadGatewayException(`Telephony provider error ${res.status}: ${JSON.stringify(data).slice(0, 800)}`);
  }
  return data;
}
