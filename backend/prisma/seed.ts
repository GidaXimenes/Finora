import { PrismaClient } from '@prisma/client';
import { SYSTEM_CATEGORIES } from '../src/categories/system-categories';

const prisma = new PrismaClient();

async function main() {
  for (const c of SYSTEM_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, color: c.color, icon: c.icon },
      create: { ...c, isSystem: true },
    });
  }
  console.log(`Categorias padrão sincronizadas: ${SYSTEM_CATEGORIES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
