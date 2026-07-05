import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  findActive() {
    return this.categoriesRepository.findActive();
  }

  findAllForAdmin() {
    return this.categoriesRepository.findAll();
  }

  async create(dto: CreateCategoryDto) {
    await this.ensureNameAvailable(dto.name);

    return this.categoriesRepository.create(dto.name);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    if (dto.name && dto.name.trim() !== category.name) {
      await this.ensureNameAvailable(dto.name);
    }

    return this.categoriesRepository.update(id, {
      ...(dto.name ? { name: dto.name.trim() } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {})
    });
  }

  async deactivate(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return this.categoriesRepository.deactivate(id);
  }

  private async ensureNameAvailable(name: string): Promise<void> {
    const existing = await this.categoriesRepository.findByName(name);

    if (existing) {
      throw new ConflictException('Category name is already used.');
    }
  }
}
