# Finance Agent UI

A modern Next.js TypeScript application for managing your investment portfolio and receiving financial advice.

## Features

- **User Profile Management**: Create, update, and delete user profiles
- **Portfolio Management**: Add and remove stock holdings
- **Financial Advice**: Generate personalized financial advice based on your holdings
- **Responsive Design**: Mobile-friendly interface built with TailwindCSS and shadcn/ui
- **Real-time Updates**: React Query for efficient API state management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (optional):
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   
   If not set, the app will default to `http://localhost:8000`.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

The application expects the following API endpoints to be available:

- `POST /create_user` - Create a new user
- `PUT /update_user` - Update user information
- `DELETE /delete_user` - Delete a user
- `GET /user/{id}` - Get user by ID
- `GET /holdings?user_id={id}` - Get user holdings
- `POST /create_holding` - Add a new holding
- `DELETE /delete_holding` - Remove a holding
- `POST /generate_advice` - Generate financial advice

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Dashboard page
│   ├── profile/           # Profile management
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Navigation component
│   ├── holdings-table.tsx # Holdings display
│   ├── add-holding-form.tsx # Add holding form
│   └── advice-card.tsx   # Financial advice display
├── lib/                  # Utility libraries
│   ├── api.ts           # API client functions
│   ├── utils.ts         # Utility functions
│   └── query-client.tsx # React Query provider
└── package.json         # Dependencies and scripts
```

## Usage

1. **Create Profile**: Start by visiting `/profile` to create your user account
2. **Add Holdings**: On the dashboard, use the form to add your stock holdings
3. **View Portfolio**: See all your holdings in the table with delete options
4. **Get Advice**: Click "Generate Advice" to receive personalized financial recommendations
5. **Manage Profile**: Update your information or delete your account from the profile page

## Build for Production

```bash
npm run build
npm start
```

## Development

- **Linting**: `npm run lint`
- **Type Checking**: Built into the TypeScript compiler

The application uses modern React patterns with hooks, TypeScript for type safety, and follows Next.js best practices for performance and SEO.