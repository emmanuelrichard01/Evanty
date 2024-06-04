// ====== USER TYPES
export interface CreateUserParams {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photo: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
}

// ====== EVENT TYPES
export interface EventDetails {
  title: string;
  description?: string;
  location?: string;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  categoryId: string;
  price: string;
  isFree: boolean;
  url?: string;
}

export interface CreateEventParams {
  userId: string;
  event: EventDetails;
  path: string;
}

export interface UpdateEventParams {
  userId: string;
  event: EventDetails & { _id: string };
  path: string;
}

export interface DeleteEventParams {
  eventId: string;
  path: string;
}

export interface GetAllEventsParams {
  query: string;
  category: string;
  limit: number;
  page: number;
}

export interface GetEventsByUserParams {
  userId: string;
  limit?: number;
  page: number;
}

export interface GetRelatedEventsByCategoryParams {
  categoryId: string;
  eventId: string;
  limit?: number;
  page: number | string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  imageUrl: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  url?: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    _id: string;
    name: string;
  };
}

// ====== CATEGORY TYPES
export interface CreateCategoryParams {
  categoryName: string;
}

// ====== ORDER TYPES
export interface CheckoutOrderParams {
  eventTitle: string;
  eventId: string;
  price: string;
  isFree: boolean;
  buyerId: string;
}

export interface CreateOrderParams {
  stripeId: string;
  eventId: string;
  buyerId: string;
  totalAmount: string;
  createdAt: Date;
}

export interface GetOrdersByEventParams {
  eventId: string;
  searchString: string;
}

export interface GetOrdersByUserParams {
  userId: string | null;
  limit?: number;
  page: string | number | null;
}

// ====== URL QUERY PARAM TYPES
export interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

export interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export interface SearchParamProps {
  page(page: any): unknown;
  category: string;
  query: string;
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}
