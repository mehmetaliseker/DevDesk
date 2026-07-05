import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { DatabaseService } from '../database/database.service';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export function mapUserRow(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toUserResponse(user: UserRecord): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<UserRecord> {
    const result = await this.database.query<UserRow>(
      `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, password_hash, role, created_at, updated_at
      `,
      [data.name, data.email, data.passwordHash, data.role]
    );

    return mapUserRow(result.rows[0]);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.database.query<UserRow>(
      `
        SELECT id, name, email, password_hash, role, created_at, updated_at
        FROM users
        WHERE email = $1
      `,
      [email.toLowerCase()]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.database.query<UserRow>(
      `
        SELECT id, name, email, password_hash, role, created_at, updated_at
        FROM users
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  async findAll(): Promise<UserRecord[]> {
    const result = await this.database.query<UserRow>(
      `
        SELECT id, name, email, password_hash, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `
    );

    return result.rows.map(mapUserRow);
  }

  async findSupportAgents(): Promise<UserRecord[]> {
    const result = await this.database.query<UserRow>(
      `
        SELECT id, name, email, password_hash, role, created_at, updated_at
        FROM users
        WHERE role = $1
        ORDER BY name ASC
      `,
      [Role.SUPPORT_AGENT]
    );

    return result.rows.map(mapUserRow);
  }

  async countUsers(): Promise<number> {
    const result = await this.database.query<{ count: string }>('SELECT COUNT(*) AS count FROM users');
    return Number(result.rows[0]?.count ?? 0);
  }
}
