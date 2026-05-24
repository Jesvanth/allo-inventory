import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  // Verify it's called by Vercel Cron (security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() },
      },
    })

    for (const reservation of expiredReservations) {
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: 'released' },
        }),
        prisma.stock.updateMany({
          where: { productId: reservation.productId },
          data: { reserved: { decrement: reservation.quantity } },
        }),
      ])
    }

    return NextResponse.json({
      message: `Expired ${expiredReservations.length} reservations`,
      count: expiredReservations.length,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}