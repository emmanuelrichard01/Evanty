import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  createdAt: Date;
  stripeId: string;
  totalAmount: string;
  event: {
    _id: Types.ObjectId;
    title: string;
  };
  buyer: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
  };
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
};

const OrderSchema = new Schema<IOrder>(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    stripeId: {
      type: String,
      required: true,
      unique: true,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Adding an index to the stripeId field for uniqueness
OrderSchema.index({ stripeId: 1 }, { unique: true });

// Adding a virtual for event title
OrderSchema.virtual('eventTitle').get(function () {
  return this.event.title;
});

// Example of a schema method
OrderSchema.methods.getBuyerFullName = function () {
  return `${this.buyer.firstName} ${this.buyer.lastName}`;
};

const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;
