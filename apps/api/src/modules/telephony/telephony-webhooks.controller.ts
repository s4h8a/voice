import { Body, Controller, Get, Header, Post } from '@nestjs/common';

@Controller('telephony')
export class TelephonyWebhooksController {
  @Post('exotel/status')
  exotelStatus(@Body() body: any) {
    return { ok: true, provider: 'exotel', received: Boolean(body) };
  }

  @Get('plivo/answer')
  @Header('Content-Type', 'application/xml')
  plivoAnswer() {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<Response>',
      '<Speak language="en-IN">Hello. This is an AI calling assistant. Thank you for testing the sales calling platform.</Speak>',
      '</Response>',
    ].join('');
  }
}
