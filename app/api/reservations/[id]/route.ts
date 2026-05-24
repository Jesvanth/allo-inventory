import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { action } = await request.json()
    const { id } = await context.params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json({ error: 'Reservation is no longer pending' }, { status: 400 })
    }

    if (action === 'confirm') {
      if (new Date() > reservation.expiresAt) {
        await prisma.$transaction([
          prisma.reservation.update({ where: { id }, data: { status: 'released' } }),
          prisma.stock.updateMany({
            where: { productId: reservation.productId },
            data: { reserved: { decrement: reservation.quantity } },
          }),
        ])
        return NextResponse.json({ error: 'Reservation has expired' }, { status: 400 })
      }

      const updated = await prisma.reservation.update({
        where: { id },
        data: { status: 'confirmed' },
      })
      return NextResponse.json(updated)

    } else if (action === 'release') {
      await prisma.$transaction([
        prisma.reservation.update({ where: { id }, data: { status: 'released' } }),
        prisma.stock.updateMany({
          where: { productId: reservation.productId },
          data: { reserved: { decrement: reservation.quantity } },
        }),
      ])
      return NextResponse.json({ message: 'Reservation released' })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Update reservation error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}