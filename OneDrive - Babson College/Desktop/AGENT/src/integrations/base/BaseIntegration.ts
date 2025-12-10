/**
 * Base class for all integrations (PMS, PBX, CRS, POS)
 */
export interface IntegrationConfig {
  apiKey?: string;
  apiUrl?: string;
  apiSecret?: string;
  [key: string]: any;
}

export interface IntegrationStatus {
  connected: boolean;
  lastSync?: Date;
  error?: string;
}

export abstract class BaseIntegration {
  protected config: IntegrationConfig;
  protected hotelId: string;

  constructor(config: IntegrationConfig, hotelId: string) {
    this.config = config;
    this.hotelId = hotelId;
  }

  /**
   * Test the integration connection
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Get integration status
   */
  abstract getStatus(): Promise<IntegrationStatus>;

  /**
   * Sync data from the integration
   */
  abstract sync(): Promise<void>;
}

