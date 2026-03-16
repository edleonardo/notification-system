import { User } from '../../domain/entities/user.entity';
import { Category } from '../../domain/enums/category.enum';

export const USER_REPOSITORY_PORT = Symbol('IUserRepository');

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findBySubscription(category: Category): Promise<User[]>;
}
