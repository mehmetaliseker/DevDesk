import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface CategoryRow {
  id: string;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryRecord {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapCategoryRow(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

@Injectable()
export class CategoriesRepository {
  constructor(private readonly database: DatabaseService) {}

  async findActive(): Promise<CategoryRecord[]> {
    const result = await this.database.query<CategoryRow>(
      `
        SELECT id, name, is_active, created_at, updated_at
        FROM categories
        WHERE is_active = TRUE
        ORDER BY name ASC
      `
    );

    return result.rows.map(mapCategoryRow);
  }

  async findAll(): Promise<CategoryRecord[]> {
    const result = await this.database.query<CategoryRow>(
      `
        SELECT id, name, is_active, created_at, updated_at
        FROM categories
        ORDER BY is_active DESC, name ASC
      `
    );

    return result.rows.map(mapCategoryRow);
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    const result = await this.database.query<CategoryRow>(
      `
        SELECT id, name, is_active, created_at, updated_at
        FROM categories
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
  }

  async findActiveById(id: string): Promise<CategoryRecord | null> {
    const result = await this.database.query<CategoryRow>(
      `
        SELECT id, name, is_active, created_at, updated_at
        FROM categories
        WHERE id = $1 AND is_active = TRUE
      `,
      [id]
    );

    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
  }

  async findByName(name: string): Promise<CategoryRecord | null> {
    const result = await this.database.query<CategoryRow>(
      `
        SELECT id, name, is_active, created_at, updated_at
        FROM categories
        WHERE name = $1
      `,
      [name.trim()]
    );

    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
  }

  async create(name: string): Promise<CategoryRecord> {
    const result = await this.database.query<CategoryRow>(
      `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING id, name, is_active, created_at, updated_at
      `,
      [name.trim()]
    );

    return mapCategoryRow(result.rows[0]);
  }

  async update(
    id: string,
    data: {
      name?: string;
      isActive?: boolean;
    }
  ): Promise<CategoryRecord | null> {
    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      params.push(data.name.trim());
      sets.push(`name = $${params.length}`);
    }

    if (data.isActive !== undefined) {
      params.push(data.isActive);
      sets.push(`is_active = $${params.length}`);
    }

    params.push(id);

    const result = await this.database.query<CategoryRow>(
      `
        UPDATE categories
        SET ${sets.join(', ')}
        WHERE id = $${params.length}
        RETURNING id, name, is_active, created_at, updated_at
      `,
      params
    );

    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
  }

  async deactivate(id: string): Promise<CategoryRecord | null> {
    const result = await this.database.query<CategoryRow>(
      `
        UPDATE categories
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, is_active, created_at, updated_at
      `,
      [id]
    );

    return result.rows[0] ? mapCategoryRow(result.rows[0]) : null;
  }

  async countCategories(): Promise<number> {
    const result = await this.database.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM categories'
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}
