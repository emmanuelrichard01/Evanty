# Evanty

Evanty is a modern, full-stack event management platform built with Next.js 14, enabling users to create, discover, and attend global events. It features a robust event organization system, secure ticket payments via Stripe, and seamless user authentication with Clerk.

![Evanty Hero](public\assets\images\hero.png)

## 🌟 Features

- **Event Management**: Create, update, and delete events with rich details (location, date, price, photos).
- **Event Discovery**: Search and filter events by category (e.g., Music, Tech, Sports) and title.
- **User Accounts**: Secure authentication and user profiles to track organized events and purchased tickets.
- **Checkout & Payments**: Integrated Stripe checkout for secure ticket purchasing.
- **Responsive Design**: Fully responsive UI/UX built with Tailwind CSS and shadcn/ui.
- **File Uploads**: Drag-and-drop image uploads for event banners using Uploadthing.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **File Storage**: [Uploadthing](https://uploadthing.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local instance)
- Clerk account
- Stripe account
- Uploadthing account

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/evanty.git
    cd evanty
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**

    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # Next.js
    NEXT_PUBLIC_SERVER_URL=http://localhost:3000

    # Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    WEBHOOK_SECRET=whsec_...

    # MongoDB
    MONGODB_URI=mongodb+srv://...

    # Uploadthing
    UPLOADTHING_SECRET=sk_live_...
    UPLOADTHING_APP_ID=...

    # Stripe
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── app/
│   ├── (auth)/             # Authentication routes
│   ├── (root)/             # Main application pages
│   ├── api/                # API routes (Webhooks for Clerk/Stripe)
│   └── layout.tsx          # Root layout
├── components/
│   ├── shared/             # Reusable app components (Card, EventForm)
│   └── ui/                 # UI primitives (Buttons, Inputs - shadcn)
├── lib/
│   ├── actions/            # Server Actions (DB mutations: createEvent, etc.)
│   ├── database/           # Database models (Event, User, Order)
│   └── utils.ts            # Utility functions
├── types/                  # TypeScript interfaces
└── public/                 # Static assets
```

## 🏗️ Architecture Highlights

- **Server Actions**: Uses Next.js Server Actions (`lib/actions`) for handling form submissions and data fetching, reducing client-side JavaScript.
- **Webhooks**: Uses Webhooks (`app/api/webhooks`) to sync user data from Clerk and payment status from Stripe securely to the MongoDB database.
- **Zod Validation**: All forms and API inputs are strictly validated using Zod schemas (`lib/validator.ts`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
