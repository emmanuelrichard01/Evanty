'use server';

import { OrderService } from '@/lib/services/order.service';
import { OrderRepository } from '@/lib/repositories/order.repo';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from '@/types';
import { redirect } from 'next/navigation';

const orderService = new OrderService(new OrderRepository());

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  try {
    const result = await orderService.createCheckout({
      psp: 'stripe',
      eventId: order.eventId,
      buyerId: order.buyerId,
      eventTitle: order.eventTitle,
      priceKobo: Number(order.price) * 100, // Converts decimal USD to cents
      isFree: order.isFree,
    });

    redirect(result.redirectUrl);
  } catch (error) {
    throw error;
  }
}

export const createOrder = async (order: CreateOrderParams) => {
  try {
    const orderRepo = new OrderRepository();
    const newOrder = await orderRepo.create({
      userId: order.buyerId,
      eventId: order.eventId,
      psp: 'stripe',
      pspReference: order.stripeId,
      amountKobo: Number(order.totalAmount) * 100,
      currency: 'USD',
      status: 'confirmed',
      idempotencyKey: order.stripeId, // Using stripe ID as idempotency key for now
    });
    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    throw error;
  }
}

export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    const orderRepo = new OrderRepository();
    const orders = await orderRepo.getByEvent(eventId, searchString);
    
    // Transform to match UI
    const transformed = orders.map(o => ({
      id: o.id,
      totalAmount: (o.amountKobo / 100).toString(),
      createdAt: o.createdAt,
      eventTitle: 'Event', // Requires JOIN in repo for real implementation
      eventId: o.eventId,
      buyer: 'Buyer Name', // Requires JOIN
    }));

    return JSON.parse(JSON.stringify(transformed));
  } catch (error) {
    throw error;
  }
}

export async function getOrdersByUser({ userId, limit = 3, page = 1 }: GetOrdersByUserParams) {
  try {
    if (!userId) throw new Error('userId is required');
    
    const orderRepo = new OrderRepository();
    const result = await orderRepo.getByUser(userId, limit, Number(page));
    
    const transformedData = result.data.map(o => ({
      id: o.id,
      totalAmount: (o.amountKobo / 100).toString(),
      createdAt: o.createdAt,
      event: { title: 'Event Title' }, // Requires JOIN
      buyer: 'Buyer Name',
    }));

    return { data: JSON.parse(JSON.stringify(transformedData)), totalPages: result.totalPages };
  } catch (error) {
    throw error;
  }
}
