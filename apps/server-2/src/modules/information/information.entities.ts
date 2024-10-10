import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Information = typeof schema.information.$inferSelect;

export class InformationPublished extends DomainEvent {}
