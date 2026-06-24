import { Campaign, Lead } from '@prisma/client';

export type ConversationTurn = { speaker: 'agent' | 'customer'; text: string; at: string };

export interface TelephonyProvider {
  startCall(lead: Lead, campaign: Campaign): Promise<{ providerCallId: string; status: string }>;
  endCall(callId: string): Promise<void>;
  getCallStatus(callId: string): Promise<string>;
  sendDTMF(callId: string, digits: string): Promise<void>;
  recordCall(callId: string): Promise<{ recordingUrl?: string }>;
}

export interface LLMProvider {
  generateResponse(context: Record<string, unknown>): Promise<string>;
  summarizeCall(transcript: ConversationTurn[]): Promise<string>;
  classifyOutcome(transcript: ConversationTurn[]): Promise<string>;
  extractPaymentIntent(transcript: ConversationTurn[]): Promise<{ wantsToPay: boolean; amountPaise?: number }>;
  detectCallbackRequest(transcript: ConversationTurn[]): Promise<{ requested: boolean; callbackAt?: string }>;
}

export interface PaymentProvider {
  createPaymentLink(
    amountPaise: number,
    customer: { name: string; phone: string; email?: string },
    description: string,
  ): Promise<{ providerPaymentId: string; paymentLink: string }>;
  verifyWebhook(payload: unknown, signature?: string): Promise<boolean>;
  getPaymentStatus(paymentId: string): Promise<string>;
}
