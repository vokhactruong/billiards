import { PrismaClient, Role, ProductCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: { username: 'owner', password: passwordHash, fullName: 'Owner Admin', role: Role.OWNER },
  })

  await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: { username: 'manager', password: passwordHash, fullName: 'Manager User', role: Role.MANAGER },
  })

  await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: { username: 'staff1', password: passwordHash, fullName: 'Staff User', role: Role.STAFF },
  })

  for (let i = 1; i <= 6; i++) {
    await prisma.table.upsert({
      where: { name: `Bàn ${i}` },
      update: {},
      create: { name: `Bàn ${i}`, pricePerHour: 60000 },
    })
  }

  const products = [
    { name: 'Coca Cola', category: ProductCategory.DRINK, costPrice: 8000, sellingPrice: 15000, stock: 100 },
    { name: 'Pepsi', category: ProductCategory.DRINK, costPrice: 8000, sellingPrice: 15000, stock: 100 },
    { name: 'Nước suối', category: ProductCategory.DRINK, costPrice: 4000, sellingPrice: 10000, stock: 200 },
    { name: 'Bia Tiger', category: ProductCategory.DRINK, costPrice: 20000, sellingPrice: 35000, stock: 50 },
    { name: 'Snack Oishi', category: ProductCategory.SNACK, costPrice: 5000, sellingPrice: 12000, stock: 80 },
    { name: 'Kẹo cao su', category: ProductCategory.SNACK, costPrice: 3000, sellingPrice: 8000, stock: 60 },
    { name: 'Khăn lau', category: ProductCategory.OTHER, costPrice: 2000, sellingPrice: 5000, stock: 50 },
  ]

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } })
    if (!existing) {
      await prisma.product.create({ data: product })
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
