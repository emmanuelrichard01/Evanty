import { Schema, model, models, Document, Model, Types } from 'mongoose';
import { IEvent } from './event.model'; // Assuming you have an IEvent interface
import { IOrder } from './order.model'; // Assuming you have an IOrder interface

// Interface for the User document
export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  events: Types.ObjectId[] | IEvent[]; // Add events property
  orders: Types.ObjectId[] | IOrder[]; // Add orders property
  fullName(): string;
}

// Interface for static methods
export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
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
    events: [{ type: Types.ObjectId, ref: 'Event' }], // Define events as an array of ObjectIds referencing Event
    orders: [{ type: Types.ObjectId, ref: 'Order' }], // Define orders as an array of ObjectIds referencing Order
  },
  {
    timestamps: true,
    versionKey: false, // Optional: Disable __v field
  }
);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// Pre-save middleware (optional)
// UserSchema.pre<IUser>('save', function (next) {
//    'Example: Add custom logic before saving'
//   next();
// });

// Static methods
// UserSchema.statics.findByEmail = async function (email: string): Promise<IUser | null> {
//   return this.findOne({ email });
// };

// Instance methods
UserSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Define User model
const User: IUserModel = models.User || model<IUser, IUserModel>('User', UserSchema) as IUserModel;

export default User;
