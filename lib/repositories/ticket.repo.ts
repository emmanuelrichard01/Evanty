import { db } from '@/lib/database';
import { ticketTypes, reservations } from '@/lib/database/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import { AppError } from '@/lib/errors';

export class TicketRepository {
  async atomicReserve(ticketTypeId: string, quantity: number, userId: string, expiresAt: Date) {
    return await db.transaction(async (tx) => {
      // 1. Atomically update the ticket type if there is enough capacity.
      // We check `capacity - reserved - sold >= quantity`.
      const [updatedTicketType] = await tx.update(ticketTypes)
        .set({
          reserved: sql`${ticketTypes.reserved} + ${quantity}`,
        })
        .where(
          and(
            eq(ticketTypes.id, ticketTypeId),
            gte(sql`${ticketTypes.capacity} - ${ticketTypes.reserved} - ${ticketTypes.sold}`, quantity)
          )
        )
        .returning();

      // If the update returned nothing, there was not enough capacity (or the ticket type doesn't exist).
      if (!updatedTicketType) {
        throw new AppError('TICKET_SOLD_OUT', 'Not enough tickets available', 409);
      }

      // 2. Create the reservation record
      const [reservation] = await tx.insert(reservations)
        .values({
          userId,
          ticketTypeId,
          quantity,
          expiresAt,
          status: 'pending',
        })
        .returning();

      return reservation;
    });
  }

  async releaseReservation(reservationId: string) {
    return await db.transaction(async (tx) => {
      // Find the pending reservation
      const [reservation] = await tx.select().from(reservations).where(
        and(eq(reservations.id, reservationId), eq(reservations.status, 'pending'))
      );

      if (!reservation) {
        return null; // Already processed or doesn't exist
      }

      // Decrement the reserved count on the ticket type
      await tx.update(ticketTypes)
        .set({
          reserved: sql`${ticketTypes.reserved} - ${reservation.quantity}`,
        })
        .where(eq(ticketTypes.id, reservation.ticketTypeId));

      // Mark reservation as expired
      const [expired] = await tx.update(reservations)
        .set({ status: 'expired' })
        .where(eq(reservations.id, reservationId))
        .returning();

      return expired;
    });
  }
}
