import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Information = typeof schema.information.$inferSelect;
export type InformationInsert = typeof schema.information.$inferInsert;

export class InformationPublished extends DomainEvent {}
