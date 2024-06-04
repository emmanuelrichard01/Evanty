import * as z from "zod";

// Event form schema using zod for validation
export const eventFormSchema = z.object({
  // Title must be at least 3 characters long
  title: z.string().min(3, 'Title must be at least 3 characters'),

  // Description must be between 3 to 400 characters
  description: z.string().min(3, 'Description must be at least 3 characters').max(400, 'Description must be less than 400 characters'),

  // Location must be between 3 to 400 characters
  location: z.string().min(3, 'Location must be at least 3 characters').max(400, 'Location must be less than 400 characters'),

  // Image URL validation
  imageUrl: z.string(),

  // Start date and time must be a valid date
  startDateTime: z.date(),

  // End date and time must be a valid date
  endDateTime: z.date(),

  // Category ID must be a string
  categoryId: z.string(),

  // Price must be a string (could be improved to handle currency formats if needed)
  price: z.string(),

  // IsFree should be a boolean
  isFree: z.boolean(),

  // URL validation
  url: z.string().url('Must be a valid URL')
});
