import { Injectable, NotFoundException } from '@nestjs/common';
import {
  toUserResponse,
  UserRecord,
  UserResponse,
  UsersRepository
} from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  toResponse(user: UserRecord): UserResponse {
    return toUserResponse(user);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.toResponse(user);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.usersRepository.findAll();

    return users.map((user) => this.toResponse(user));
  }

  async findSupportAgents(): Promise<UserResponse[]> {
    const users = await this.usersRepository.findSupportAgents();

    return users.map((user) => this.toResponse(user));
  }
}
