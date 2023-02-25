import { Entity } from '../../../common/ddd/entity';

type RequestProps = {
  id: string;
  title: string;
  description: string;
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
}
