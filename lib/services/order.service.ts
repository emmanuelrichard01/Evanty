import { OrderRepository } from '@/lib/repositories/order.repo';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

// Simple types for the payload
interface CreateCheckoutInput {
  psp: 'stripe' | 'paystack';
  reservationId?: string; // In full flow, this comes from a reservation.
  eventId: string;
  buyerId: string;
  eventTitle: string;
  priceKobo: number;
  isFree?: boolean;
}

export class OrderService {
  private stripe: Stripe;

  constructor(private readonly orderRepo: OrderRepository) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckout(input: CreateCheckoutInput): Promise<{ redirectUrl: string }> {
    logger.info({
      service: 'order-service',
      event: 'checkout.started',
      meta: { psp: input.psp, eventId: input.eventId, buyerId: input.buyerId },
    });

    try {
      if (input.isFree) {
        // Free ticket logic...
        // Normally bypass PSP and just confirm order directly
        const order = await this.orderRepo.create({
          userId: input.buyerId,
          eventId: input.eventId,
          psp: 'none',
          amountKobo: 0,
          currency: 'NGN',
          status: 'confirmed',
        });
        return { redirectUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile` };
      }

      if (input.psp === 'stripe') {
        return this.createStripeCheckout(input);
      } else {
        return this.createPaystackCheckout(input);
      }
    } catch (error) {
      logger.error({
        service: 'order-service',
        event: 'checkout.failed',
        error,
      });
      throw new AppError('CHECKOUT_SESSION_FAILED', 'Failed to create checkout session', 500, error);
    }
  }

  private async createStripeCheckout(input: CreateCheckoutInput): Promise<{ redirectUrl: string }> {
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd', // Typically Stripe handles USD, or local currency
            unit_amount: input.priceKobo, // Note: Stripe uses cents, so this aligns if price is in cents
            product_data: {
              name: input.eventTitle
            }
          },
          quantity: 1
        },
      ],
      metadata: {
        eventId: input.eventId,
        buyerId: input.buyerId,
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
    });

    if (!session.url) throw new Error('Stripe session URL is null');

    return { redirectUrl: session.url };
  }

  private async createPaystackCheckout(input: CreateCheckoutInput): Promise<{ redirectUrl: string }> {
    // Paystack integration stub
    // In a real implementation, you'd use a Paystack HTTP client
    logger.warn({
      service: 'order-service',
      event: 'paystack.checkout.stub',
      meta: { input }
    });
    
    return { redirectUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile` };
  }

  async processWebhook(payload: any, psp: 'stripe' | 'paystack') {
    // Webhook processing logic handles idempotency
    // Extract idempotencyKey from payload (e.g. Stripe event ID)
    const idempotencyKey = payload.id; 
    
    const existingOrder = await this.orderRepo.getByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      logger.info({
        service: 'order-service',
        event: 'webhook.ignored_duplicate',
        meta: { idempotencyKey }
      });
      return { status: 'ignored_duplicate' };
    }

    // Process order fulfillment here...
    // Insert into orders table, change reservation status to converted, etc.

    return { status: 'processed' };
  }
}
