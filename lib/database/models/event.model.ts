import { Document, Schema, model, models, Model } from 'mongoose';

// Interface for the Event document
export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: Date;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  category: { _id: string, name: string }
  organizer: { _id: string, firstName: string, lastName: string }
}

// Event schema definition
const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: Date.now },
    imageUrl: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/, 'Please fill a valid URL for the image'],
    },
    startDateTime: { type: Date, default: Date.now },
    endDateTime: { type: Date, default: Date.now },
    price: { type: String },
    isFree: { type: Boolean, default: false },
    url: { type: String, match: [/^https?:\/\/.+/, 'Please fill a valid URL'] },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Static methods
EventSchema.statics.findByCategory = function (categoryId: string) {
  return this.find({ category: categoryId });
};

// Instance methods
EventSchema.methods.isOngoing = function () {
  const now = new Date();
  return this.startDateTime <= now && this.endDateTime >= now;
};

// Define Event model
const Event: Model<IEvent> = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
