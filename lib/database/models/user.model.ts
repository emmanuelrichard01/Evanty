import { Schema, model, models, Document, Model, Types } from 'mongoose';
import { IEvent } from './event.model';
import { IOrder } from './order.model';

// Interface for the User document
export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
}


// User schema definition
const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    photo: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/, 'Please fill a valid URL for the photo'],
    },
  },
  {
    timestamps: true,
    versionKey: false, // Optional: Disable __v field
  }
);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });


// Define User model
const User = models.User || model<IUser>('User', UserSchema);

export default User;
