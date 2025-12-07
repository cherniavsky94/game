# Isometric RPG Game

Online multiplayer isometric RPG built with Phaser 4, Colyseus, and Supabase.

## Tech Stack

- **Client**: Phaser 4, TypeScript, Vite
- **Server**: Node.js, Colyseus, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Supabase
- **Dev Environment**: GitHub Codespaces / Dev Containers

## Project Structure

```
.
├── client/          # Phaser 4 game client
│   ├── src/
│   │   ├── scenes/  # Game scenes
│   │   ├── utils/   # Client utilities
│   │   └── main.ts  # Entry point
│   └── index.html
├── server/          # Colyseus game server
│   ├── src/
│   │   ├── rooms/   # Game rooms
│   │   ├── schemas/ # Colyseus state schemas
│   │   └── utils/   # Server utilities
│   └── index.ts
├── shared/          # Shared types and constants
│   └── src/
│       ├── types/
│       ├── constants/
│       └── utils/
└── prisma/          # Database schema
    └── schema.prisma
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example files and fill in your credentials:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

**Client (.env):**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server (.env):**
```
PORT=2567
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=postgresql://user:password@localhost:5432/isometric_rpg
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Start Development Servers

```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:client  # Port 3000
npm run dev:server  # Port 2567
```

### 5. Access the Application

- **Game Client**: http://localhost:3000
- **Server Health**: http://localhost:2567/health
- **Colyseus Monitor**: http://localhost:2567/colyseus

## Development

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:client
npm run build:server
```

### Shared Package

The `shared/` package contains types, constants, and utilities used by both client and server. After making changes:

```bash
npm run build --workspace=shared
```

## Features

- ✅ Isometric grid rendering
- ✅ Real-time multiplayer with Colyseus
- ✅ Player movement and synchronization
- ✅ Supabase authentication
- ✅ PostgreSQL database with Prisma
- ✅ Character and inventory system
- ✅ TypeScript throughout

## Next Steps

1. Configure Supabase project and add credentials
2. Set up PostgreSQL database (local or Supabase)
3. Run Prisma migrations
4. Implement game mechanics
5. Add sprites and assets
6. Implement combat system
7. Add UI/HUD elements

## Scripts

- `npm run dev` - Start both client and server
- `npm run build` - Build all packages
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Port Configuration

- **3000**: Phaser client (Vite dev server)
- **2567**: Colyseus game server

Both ports are automatically forwarded in GitHub Codespaces.