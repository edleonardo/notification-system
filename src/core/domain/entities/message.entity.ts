import { v4 as uuidv4 } from 'uuid';
import { Category } from '../enums/category.enum';

export class Message {
  readonly id: string;
  readonly category: Category;
  readonly body: string;
  readonly createdAt: Date;

  constructor(props: {
    category: Category;
    body: string;
    id?: string;
    createdAt?: Date;
  }) {
    this.id = props.id ?? uuidv4();
    this.category = props.category;
    this.body = props.body;
    this.createdAt = props.createdAt ?? new Date();
  }
}
