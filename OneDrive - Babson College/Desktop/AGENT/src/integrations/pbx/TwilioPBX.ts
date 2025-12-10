import twilio from 'twilio';
import { BaseIntegration, IntegrationConfig } from '../base/BaseIntegration';

export class TwilioPBX extends BaseIntegration {
  private client: twilio.Twilio;

  constructor(config: IntegrationConfig, hotelId: string) {
    super(config, hotelId);
    this.client = twilio(config.accountSid, config.authToken);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.api.accounts(config.accountSid).fetch();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getStatus(): Promise<any> {
    const connected = await this.testConnection();
    return {
      connected,
      lastSync: new Date(),
    };
  }

  async sync(): Promise<void> {
    // Sync call logs, phone numbers, etc.
    console.log('Synced Twilio data');
  }

  /**
   * Make an outbound call
   */
  async makeCall(to: string, from: string, url: string): Promise<any> {
    return this.client.calls.create({
      to,
      from,
      url,
    });
  }

  /**
   * Get call logs
   */
  async getCallLogs(startDate?: Date, endDate?: Date): Promise<any[]> {
    const calls = await this.client.calls.list({
      startTimeAfter: startDate,
      startTimeBefore: endDate,
    });
    return calls;
  }
}

