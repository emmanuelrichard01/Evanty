'use server';

import { revalidatePath } from 'next/cache';
import { EventService } from '@/lib/services/event.service';
import { EventRepository } from '@/lib/repositories/event.repo';
import { CreateEventParams, UpdateEventParams, DeleteEventParams, GetAllEventsParams, GetEventsByUserParams, GetRelatedEventsByCategoryParams } from '@/types';
import { AppError } from '@/lib/errors';
import { getOrCreateUserOrg } from '@/lib/authUtils';

// Instantiate the service using Dependency Injection
const eventService = new EventService(new EventRepository());

export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Missing user ID', 401);
    }
    const orgId = await getOrCreateUserOrg(userId);

    const newEvent = await eventService.createEvent({
      orgId: orgId,
      title: event.title,
      slug: event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Clean slug generation
      description: event.description,
      location: event.location,
      coverUrl: event.imageUrl,
      startsAt: event.startDateTime,
      endsAt: event.endDateTime,
      timezone: 'UTC',
      status: 'published',
      categoryId: event.categoryId,
    }, userId);

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('CREATE_EVENT_FAILED', 'Failed to create event', 500, error);
  }
}

export async function getEventById(eventId: string) {
  try {
    const event = await eventService.getEvent(eventId);
    
    // Split organizerName into firstName and lastName
    const [firstName = '', ...lastNameParts] = (event.organizerName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    return JSON.parse(JSON.stringify({
      ...event,
      organizer: { 
        id: event.organizerId || event.orgId, 
        firstName: firstName || 'Org', 
        lastName: lastName || '' 
      },
      category: { id: event.categoryId || '', name: event.categoryName || '' },
      imageUrl: event.coverUrl,
      startDateTime: event.startsAt,
      endDateTime: event.endsAt,
    }));
  } catch (error) {
    throw error;
  }
}

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    const updatedEvent = await eventService.updateEvent(event.id, {
      title: event.title,
      description: event.description,
      location: event.location,
      coverUrl: event.imageUrl,
      startsAt: event.startDateTime,
      endsAt: event.endDateTime,
      categoryId: event.categoryId,
    }, userId);

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    throw error;
  }
}

export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    // Requires getting user ID in reality, but stubs for now
    await eventService.deleteEvent(eventId, 'system');
    revalidatePath(path);
  } catch (error) {
    throw error;
  }
}

export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    const result = await eventService.getAllEvents({ query, category, limit, page });
    
    // Transform data to match UI expectations
    const transformedData = result.data.map(event => {
      const [firstName = '', ...lastNameParts] = (event.organizerName || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      return {
        ...event,
        organizer: { 
          id: event.organizerId || event.orgId, 
          firstName: firstName || 'Org', 
          lastName: lastName || '' 
        },
        category: { id: event.categoryId || '', name: event.categoryName || '' },
        imageUrl: event.coverUrl,
        startDateTime: event.startsAt,
        endDateTime: event.endsAt,
      };
    });

    return {
      data: JSON.parse(JSON.stringify(transformedData)),
      totalPages: result.totalPages,
    };
  } catch (error) {
    throw error;
  }
}

export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    if (!userId) {
      return { data: [], totalPages: 0 };
    }
    const orgId = await getOrCreateUserOrg(userId);
    const result = await eventService.getEventsByOrganizer(orgId, limit, page);
    
    const transformedData = result.data.map(event => {
      const [firstName = '', ...lastNameParts] = (event.organizerName || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      return {
        ...event,
        organizer: { 
          id: event.organizerId || event.orgId, 
          firstName: firstName || 'Org', 
          lastName: lastName || '' 
        },
        category: { id: event.categoryId || '', name: event.categoryName || '' },
        imageUrl: event.coverUrl,
        startDateTime: event.startsAt,
        endDateTime: event.endsAt,
      };
    });

    return {
      data: JSON.parse(JSON.stringify(transformedData)),
      totalPages: result.totalPages,
    };
  } catch (error) {
    throw error;
  }
}

export async function getRelatedEventsByCategory({ categoryId, eventId, limit = 3, page = 1 }: GetRelatedEventsByCategoryParams) {
  try {
    const result = await eventService.getAllEvents({ category: categoryId, limit, page: Number(page) });
    
    // Filter out current event
    const filteredData = result.data.filter(e => e.id !== eventId);
    
    const transformedData = filteredData.map(event => {
      const [firstName = '', ...lastNameParts] = (event.organizerName || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      return {
        ...event,
        organizer: { 
          id: event.organizerId || event.orgId, 
          firstName: firstName || 'Org', 
          lastName: lastName || '' 
        },
        category: { id: event.categoryId || '', name: event.categoryName || '' },
        imageUrl: event.coverUrl,
        startDateTime: event.startsAt,
        endDateTime: event.endsAt,
      };
    });

    return {
      data: JSON.parse(JSON.stringify(transformedData)),
      totalPages: result.totalPages,
    };
  } catch (error) {
    throw error;
  }
}

