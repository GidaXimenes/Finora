import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, ListCategoriesDto, UpdateCategoryDto } from './dto/category.dto';
import { SYSTEM_CATEGORIES } from './system-categories';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  /** Garante as categorias padrão sem depender de rodar o seed manualmente. */
  async onModuleInit() {
    for (const c of SYSTEM_CATEGORIES) {
      await this.prisma.category.upsert({
        where: { id: c.id },
        update: { name: c.name, color: c.color, icon: c.icon },
        create: { ...c, isSystem: true },
      });
    }
  }

  findAll(userId: string, q: ListCategoriesDto) {
    const where: Prisma.CategoryWhereInput = {
      OR: [{ userId: null }, { userId }],
      ...(q.type ? { type: q.type } : {}),
      ...(q.includeInactive === 'true' ? {} : { active: true }),
    };
    return this.prisma.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name.trim(),
        type: dto.type,
        color: dto.color ?? '#8FA3A0',
        icon: dto.icon ?? 'tag',
      },
    });
  }

  private async findOwned(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, OR: [{ userId: null }, { userId }] },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.isSystem) throw new ForbiddenException('Categorias padrão não podem ser alteradas');
    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.findOwned(userId, id);
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(dto.name ? { name: dto.name.trim() } : {}) },
    });
  }

  /** Exclusão lógica quando a categoria já tem histórico; física caso contrário. */
  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    const [transactions, budgets] = await Promise.all([
      this.prisma.transaction.count({ where: { categoryId: id } }),
      this.prisma.budget.count({ where: { categoryId: id } }),
    ]);
    if (transactions + budgets > 0) {
      await this.prisma.category.update({ where: { id }, data: { active: false } });
      return { deleted: false, deactivated: true };
    }
    await this.prisma.category.delete({ where: { id } });
    return { deleted: true, deactivated: false };
  }
}
