import { Schema, model, models } from 'mongoose';
// User schema definition
const UserSchema = new Schema(
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
const User = models.User || model('User', UserSchema);

export default User;
