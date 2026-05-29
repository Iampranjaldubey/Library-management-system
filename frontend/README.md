# Library Management System - Frontend

A modern, production-ready frontend application built with Next.js 16, React 19, and TypeScript.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: React Context API + Custom Hooks
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **HTTP Client**: Native Fetch API

## 📋 Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Backend API running (default: http://localhost:8080)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment**
   Edit `.env.local` and set your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes (login, register)
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── books/          # Book management
│   │   ├── issue/          # Issue books
│   │   ├── return/         # Return books
│   │   └── transactions/   # Transaction history
│   ├── unauthorized/        # 403 error page
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Root redirect
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── books/              # Book management components
│   ├── dashboard/          # Dashboard components
│   ├── issue/              # Issue flow components
│   ├── return/             # Return flow components
│   ├── transactions/       # Transaction components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── context/                 # React Context providers
│   └── auth-context.tsx    # Authentication state management
├── hooks/                   # Custom React hooks
│   ├── use-books.ts        # Book data fetching & filtering
│   ├── use-transactions.ts # Transaction data fetching
│   ├── use-issue-form.ts   # Issue book form logic
│   ├── use-return-form.ts  # Return book form logic
│   └── use-protected-route.ts # Route protection
├── lib/                     # Utility libraries
│   ├── api.ts              # Core API client
│   ├── auth.ts             # Authentication service
│   ├── permissions.ts      # Role-based access control
│   ├── transaction-service.ts # Transaction business logic
│   ├── return-service.ts   # Return business logic
│   └── utils.ts            # Utility functions
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # TypeScript type definitions
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based access control (RBAC):

### Roles
- **ADMIN**: Full system access
- **LIBRARIAN**: Manage books, issue/return operations, view transactions
- **USER**: View books only

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/dashboard/issue` - Requires ADMIN or LIBRARIAN role
- `/dashboard/return` - Requires ADMIN or LIBRARIAN role
- `/dashboard/transactions` - Requires ADMIN or LIBRARIAN role

## 🎨 UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) components built on top of Radix UI primitives. All components are:
- Fully accessible (WCAG compliant)
- Customizable via Tailwind CSS
- Type-safe with TypeScript
- Responsive and mobile-friendly

## 📊 State Management

### Global State
- **AuthContext**: Manages user authentication state, role-based permissions, and session handling

### Local State
- Custom hooks for data fetching (`use-books`, `use-transactions`)
- Form state managed by React Hook Form
- UI state managed by component-level useState/useReducer

## 🔄 API Integration

The application uses a centralized API client (`lib/api.ts`) with:
- Automatic JWT token injection
- Request/response interceptors
- Structured error handling
- Automatic 401 (unauthorized) handling
- Development mode logging

### API Endpoints
```typescript
// Books
GET    /api/books
POST   /api/books
PUT    /api/books/{id}
DELETE /api/books/{id}

// Transactions
GET    /api/transactions
POST   /api/transactions/issue
POST   /api/transactions/return

// Authentication
POST   /api/auth/login
POST   /api/auth/register
```

## 🚀 Deployment

### Environment Variables

Create a `.env.production` file:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

### Deployment Options

#### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### 2. Docker
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t library-frontend .
docker run -p 3000:3000 library-frontend
```

#### 3. Static Export (if applicable)
```bash
npm run build
npm run export
```

#### 4. Node.js Server
```bash
npm run build
npm run start
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testing

### Unit Tests (Future Enhancement)
```bash
npm run test
```

### E2E Tests (Future Enhancement)
```bash
npm run test:e2e
```

## 🔧 Configuration

### TypeScript
Configuration in `tsconfig.json`:
- Strict mode enabled
- Path aliases configured (`@/` points to root)
- Next.js plugin enabled

### Tailwind CSS
Configuration in `tailwind.config.ts`:
- Custom color palette
- Extended theme with design tokens
- shadcn/ui integration

### ESLint
Configuration in `.eslintrc.json`:
- Next.js recommended rules
- TypeScript support
- React hooks rules

## 📈 Performance Optimizations

- ✅ Code splitting with dynamic imports
- ✅ Image optimization with Next.js Image component
- ✅ Bundle size optimization
- ✅ Lazy loading for heavy components
- ✅ Memoization for expensive computations
- ✅ Request deduplication
- ✅ Optimized re-renders with React.memo

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Error**
```
Error: Failed to fetch
```
**Solution**: Check that the backend API is running and `NEXT_PUBLIC_API_URL` is correctly set.

**2. Authentication Issues**
```
Error: 401 Unauthorized
```
**Solution**: Clear browser localStorage and cookies, then log in again.

**3. Build Errors**
```
Error: TypeScript errors found
```
**Solution**: Run `npm run lint` to identify and fix TypeScript errors.

## 📝 Code Style Guide

### Naming Conventions
- **Files**: kebab-case (`use-books.ts`, `book-card.tsx`)
- **Components**: PascalCase (`BookCard`, `PageHeader`)
- **Functions**: camelCase (`fetchBooks`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_PAGE_SIZE`)

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface Props {
  title: string
}

// 3. Component
export function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Handlers
  const handleClick = () => {}
  
  // 6. Render
  return <div>{title}</div>
}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Build the project: `npm run build`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Next.js and React**
