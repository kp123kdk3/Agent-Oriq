import { BasePMS } from './BasePMS';
import { OperaPMS } from './OperaPMS';
import { MewsPMS } from './MewsPMS';
import { IntegrationConfig } from '../base/BaseIntegration';

export class PMSFactory {
  static create(type: string, config: IntegrationConfig, hotelId: string): BasePMS {
    switch (type.toLowerCase()) {
      case 'opera':
        return new OperaPMS(config, hotelId);
      case 'mews':
        return new MewsPMS(config, hotelId);
      case 'cloudbeds':
        // TODO: Implement CloudbedsPMS
        throw new Error('Cloudbeds integration not yet implemented');
      case 'roomraccoon':
        // TODO: Implement RoomRaccoonPMS
        throw new Error('RoomRaccoon integration not yet implemented');
      default:
        throw new Error(`Unknown PMS type: ${type}`);
    }
  }
}

