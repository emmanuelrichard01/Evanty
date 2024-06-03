import { Schema, model, models, Document, Model } from 'mongoose';

// Interface for the User document
interface IUser extends Document {
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
    email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Please fill a valid email address'] },
    username: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    photo: { type: String, required: true, match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/, 'Please fill a valid URL for the photo'] },
  },
  {
    timestamps: true,
    versionKey: false, // Optional: Disable __v field
  }
);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// Pre-save middleware (optional): You can add hooks for validation, logging, etc.
UserSchema.pre<IUser>('save', function (next) {
  // Example: Add custom logic before saving
  next();
});

// Static methods
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

// Instance methods
UserSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Define User model
const User: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export default User;
