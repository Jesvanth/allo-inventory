const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const warehouse1 = await prisma.warehouse.upsert({
    where: { id: 'warehouse-1' },
    update: {},
    create: { id: 'warehouse-1', name: 'Main Warehouse', location: 'Chennai, India' },
  })
  const products = [
    { id: 'product-1', name: 'Wireless Headphones', description: 'Premium noise-cancelling headphones', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { id: 'product-2', name: 'Mechanical Keyboard', description: 'RGB mechanical gaming keyboard', price: 4499, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
    { id: 'product-3', name: 'USB-C Hub', description: '7-in-1 USB-C multiport adapter', price: 1499, imageUrl: 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400' },
    { id: 'product-4', name: 'Webcam HD', description: '1080p HD webcam with mic', price: 3299, imageUrl: 'https://images.unsplash.com/photo-1596566644118-d29d5bd5e9af?w=400' },
  ]
  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, update: {}, create: product })
    await prisma.stock.upsert({
      where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse1.id } },
      update: {},
      create: { productId: product.id, warehouseId: warehouse1.id, total: 10, reserved: 0 },
    })
  }
  console.log('✅ Seed data created successfully!')
}
main().catch(console.error).finally(() => prisma.$disconnect())