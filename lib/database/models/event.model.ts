import { Document, Schema, model, models, Model } from 'mongoose';

// Interface for the Event document
export interface IEvent extends Document {
  _id: string
  title: string;
  description?: string;
  location?: string;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url?: string;
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string };
}

// Event schema definition
const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    imageUrl: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/, 'Please fill a valid URL for the image'],
    },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    price: { type: String, required: true },
    isFree: { type: Boolean, default: false },
    url: { type: String, match: [/^https?:\/\/.+/, 'Please fill a valid URL'] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Optional: Disable __v field
  }
);

// Add indexes
EventSchema.index({ title: 1 });
EventSchema.index({ startDateTime: 1 });

// Pre-save middleware (optional): Add hooks for validation, logging, etc.
EventSchema.pre<IEvent>('save', function (next) {
  // Example: Add custom logic before saving
  next();
});

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
