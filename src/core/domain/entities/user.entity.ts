import { Category } from '../enums/category.enum';
import { Channel } from '../enums/channel.enum';

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly subscriptions: Category[];
  readonly channels: Channel[];

  constructor(props: {
    id: string;
    name: string;
    email: string;
    phone: string;
    subscriptions: Category[];
    channels: Channel[];
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.subscriptions = [...props.subscriptions];
    this.channels = [...props.channels];
  }

  isSubscribedTo(category: Category): boolean {
    return this.subscriptions.includes(category);
  }

  getNotificationChannels(): Channel[] {
    return [...this.channels];
  }
}
