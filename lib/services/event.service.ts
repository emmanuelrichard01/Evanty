import { EventRepository } from '@/lib/repositories/event.repo';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { events } from '@/lib/database/schema';

export class EventService {
  constructor(private readonly eventRepo: EventRepository) {}

  async createEvent(data: typeof events.$inferInsert, userId: string, traceId?: string) {
    logger.info({
      service: 'event-service',
      event: 'event.creation_attempt',
      traceId,
      meta: { title: data.title, orgId: data.orgId, userId },
    });

    try {
      // Assuming authorization is done before reaching here, or we can do it here if needed.
      // But usually, we verify if user belongs to org in OrgService.
      const event = await this.eventRepo.create(data);
      
      logger.info({
        service: 'event-service',
        event: 'event.created',
        traceId,
        meta: { eventId: event.id, orgId: event.orgId },
      });

      return event;
    } catch (error) {
      logger.error({
        service: 'event-service',
        event: 'event.creation_failed',
        traceId,
        error,
      });
      throw new AppError('EVENT_CREATION_FAILED', 'Failed to create event', 500, error);
    }
  }

  async getEvent(id: string) {
    const event = await this.eventRepo.getById(id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }
    return event;
  }

  async updateEvent(id: string, data: Partial<typeof events.$inferInsert>, userId: string, traceId?: string) {
    const existing = await this.eventRepo.getById(id);
    if (!existing) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }

    try {
      const event = await this.eventRepo.update(id, data);
      
      logger.info({
        service: 'event-service',
        event: 'event.updated',
        traceId,
        meta: { eventId: event.id },
      });

      return event;
    } catch (error) {
      throw new AppError('EVENT_UPDATE_FAILED', 'Failed to update event', 500, error);
    }
  }

  async deleteEvent(id: string, userId: string, traceId?: string) {
    const existing = await this.eventRepo.getById(id);
    if (!existing) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }

    try {
      await this.eventRepo.delete(id);
      
      logger.info({
        service: 'event-service',
        event: 'event.deleted',
        traceId,
        meta: { eventId: id },
      });
    } catch (error) {
      throw new AppError('EVENT_DELETE_FAILED', 'Failed to delete event', 500, error);
    }
  }

  async getAllEvents(params: { query?: string, category?: string, limit?: number, page?: number }) {
    return this.eventRepo.getAll(params);
  }

  async getEventsByOrganizer(orgId: string, limit?: number, page?: number) {
    return this.eventRepo.getByOrganizer(orgId, limit, page);
  }
}
