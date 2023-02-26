import { Entity } from '../../../common/ddd/entity';
import { Timestamp } from '../../../common/timestamp.value-object';

type RequestProps = {
  id: string;
  title: string;
  description: string;
  creationDate: Timestamp;
  lastEditionDate: Timestamp;
};

export class Request extends Entity<RequestProps> {
  get id() {
    return this.props.id;
  }

  get title() {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
  }

  get description() {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get creationDate() {
    return this.props.creationDate;
  }

  set creationDate(date: Timestamp) {
    this.props.creationDate = date;
  }

  get lastEditionDate() {
    return this.props.lastEditionDate;
  }

  set lastEditionDate(date: Timestamp) {
    this.props.lastEditionDate = date;
  }
}
