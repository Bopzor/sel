import { DomainEvent } from '../domain-event';

export class InformationEvent extends DomainEvent {
  entity = 'information';
}

export class InformationPublished extends InformationEvent {}
