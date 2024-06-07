import { Schema, model, models, Document } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  _id: string;
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
  }
);

// Define User model
const User = models.User || model<IUser>('User', UserSchema);

export default User;
