import { TicketRepository } from '@/lib/repositories/ticket.repo';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';

export class TicketService {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async reserveTickets(ticketTypeId: string, quantity: number, userId: string, traceId?: string) {
    logger.info({
      service: 'ticket-service',
      event: 'reservation.attempt',
      traceId,
      meta: { ticketTypeId, quantity, userId },
    });

    try {
      // 10-minute TTL for reservation
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
      
      const reservation = await this.ticketRepo.atomicReserve(ticketTypeId, quantity, userId, expiresAt);

      logger.info({
        service: 'ticket-service',
        event: 'reservation.success',
        traceId,
        meta: { reservationId: reservation.id },
      });

      // Here is where we would enqueue the BullMQ job for expiration
      // await bullQueue.add('expire-reservation', { reservationId: reservation.id }, { delay: 10 * 60 * 1000 });

      return reservation;
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn({
          service: 'ticket-service',
          event: 'reservation.failed',
          traceId,
          error,
        });
        throw error;
      }

      logger.error({
        service: 'ticket-service',
        event: 'reservation.error',
        traceId,
        error,
      });
      throw new AppError('RESERVATION_ERROR', 'An unexpected error occurred during reservation', 500, error);
    }
  }

  async releaseReservation(reservationId: string, traceId?: string) {
    try {
      const expired = await this.ticketRepo.releaseReservation(reservationId);
      if (expired) {
        logger.info({
          service: 'ticket-service',
          event: 'reservation.released',
          traceId,
          meta: { reservationId },
        });
      }
      return expired;
    } catch (error) {
      logger.error({
        service: 'ticket-service',
        event: 'reservation.release_error',
        traceId,
        error,
      });
      throw new AppError('RESERVATION_RELEASE_ERROR', 'Failed to release reservation', 500, error);
    }
  }
}
