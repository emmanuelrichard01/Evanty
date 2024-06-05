import { Document, Schema, model, models } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Adding an index to the name field for faster queries
CategorySchema.index({ name: 1 });

// Example of a virtual property
CategorySchema.virtual('lowercaseName').get(function () {
  return this.name.toLowerCase();
});

// Example of a schema method
CategorySchema.methods.findSimilarCategories = function () {
  return this.model('Category').find({ name: this.name });
};

const Category = models.Category || model<ICategory>('Category', CategorySchema);

export default Category;
