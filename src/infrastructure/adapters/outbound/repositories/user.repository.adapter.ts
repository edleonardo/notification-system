import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../core/ports/outbound/user-repository.port';
import { User } from '../../../../core/domain/entities/user.entity';
import { Category } from '../../../../core/domain/enums/category.enum';
import { MOCK_USERS } from '../../../database/seeders/users.seeder';

@Injectable()
export class UserRepositoryAdapter implements IUserRepository {
  private readonly users: User[] = MOCK_USERS;

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findBySubscription(category: Category): Promise<User[]> {
    return this.users.filter((u) => u.isSubscribedTo(category));
  }
}
