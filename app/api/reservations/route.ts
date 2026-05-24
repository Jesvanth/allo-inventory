import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// In-memory lock for concurrency control
const locks = new Set<string>()

export async function POST(request: Request) {
  try {
    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    // Check lock
    if (locks.has(productId)) {
      return NextResponse.json({ error: 'Another reservation is in progress. Please try again.' }, { status: 409 })
    }

    locks.add(productId)

    try {
      const stock = await prisma.stock.findFirst({
        where: { productId },
      })

      if (!stock) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const available = stock.total - stock.reserved

      if (available < quantity) {
        return NextResponse.json({ error: 'Not enough stock available' }, { status: 400 })
      }

      const [reservation] = await prisma.$transaction([
        prisma.reservation.create({
          data: {
            productId,
            quantity,
            status: 'pending',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        }),
        prisma.stock.update({
          where: { id: stock.id },
          data: { reserved: { increment: quantity } },
        }),
      ])

      return NextResponse.json(reservation, { status: 201 })
    } finally {
      locks.delete(productId)
    }
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}