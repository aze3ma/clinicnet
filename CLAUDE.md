# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant clinic management system backend built with NestJS, Prisma, and PostgreSQL. The system supports multiple clinics (tenants) with branches, providers (doctors), patients, appointments, and invoicing.

## Architecture

### Multi-Tenancy Model
- **Clinic** is the top-level tenant entity
- Each clinic can have multiple **Branches** (physical locations)
- **Users** (staff: admins, doctors, reception) belong to a clinic
- **Providers** are doctors linked to users and assigned to branches
- **Patients** are scoped per clinic (phone number is unique per clinic)
- All appointments, invoices, and data are isolated by `clinicId`

### Database Layer
- Uses Prisma ORM with PostgreSQL
- **PrismaService** ([src/common/database/prisma.service.ts](src/common/database/prisma.service.ts)) is a global service exported by **DatabaseModule**
- Access Prisma client via `prismaService.client` property
- Schema location: [prisma/schema.prisma](prisma/schema.prisma)

### Key Domain Models
- **Clinic**: Tenant with subdomain, branding, subscription info
- **Branch**: Physical location with opening hours, timezone, settings
- **User**: Staff members with roles (ADMIN, DOCTOR, RECEPTION, PATIENT)
- **Provider**: Doctor profile with specialty, consultation fees, availability
- **Patient**: Phone-first patient records (phone is primary identifier)
- **Appointment**: Scheduling with status tracking (SCHEDULED, CONFIRMED, CANCELLED, etc.)
- **Invoice**: Payment tracking linked to appointments

### Application Structure
- Global API prefix: `/api`
- API versioning enabled (URI-based)
- ConfigModule is global
- DatabaseModule is global (PrismaService available everywhere)
- Modules organized under `src/modules/` directory
- Common/shared code in `src/common/` directory

## Development Commands

### Setup & Dependencies
```bash
npm install
```

### Database
```bash
# Start PostgreSQL and pgAdmin via Docker
docker-compose up -d

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration-name>

# Push schema changes without migration (dev only)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

Database connection:
- PostgreSQL runs on `localhost:5432`
- pgAdmin UI available at `http://localhost:5050`
- Credentials in [.env.example](.env.example)

### Running the Application
```bash
# Development with watch mode
npm run start:dev

# Production build and run
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

Default server port: 3000 (configurable via PORT env var)

### Code Quality
```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run format
```

### Testing
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- path/to/file.spec.ts

# Run tests with coverage
npm run test:cov

# Debug tests
npm run test:debug

# Run e2e tests
npm run test:e2e
```

## Important Technical Details

### TypeScript Configuration
- Module system: `nodenext` (ESM-compatible)
- Target: ES2023
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Strict null checks enabled
- Source maps enabled for debugging

### Prisma Schema Conventions
- All IDs use `@default(cuid())`
- Timestamps: `createdAt` and `updatedAt` on all models
- Use `@index` for frequently queried fields
- Cascade deletes configured for tenant data cleanup
- JSON fields used for flexible settings/branding
- Enums defined for status fields (UserRole, AppointmentStatus, PaymentStatus, Gender)

### Multi-Tenant Data Access
- Always filter queries by `clinicId` to ensure tenant isolation
- Phone numbers are unique per clinic, not globally
- Use composite indexes like `[clinicId, isOpen]` for efficient queries

### Provider Availability
- ProviderAvailability model stores recurring weekly schedules
- dayOfWeek: 0=Sunday, 6=Saturday
- Times stored as strings ("09:00", "17:00")
- Slot duration (in minutes) configured per provider

### Module Generation
Use NestJS CLI to generate resources:
```bash
# Generate complete CRUD resource
nest g resource modules/<name>

# Generate module only
nest g module modules/<name>

# Generate controller
nest g controller modules/<name>

# Generate service
nest g service modules/<name>
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Start Docker services: `docker-compose up -d`
3. Run migrations: `npx prisma migrate dev`
4. Start development server: `npm run start:dev`
