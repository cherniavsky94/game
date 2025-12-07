# Setup Instructions

## Quick Start

After the dev container rebuilds with Node.js installed:

```bash
# Install all dependencies
npm install

# Build shared package
npm run build --workspace=shared

# Start development servers
npm run dev
```

## Environment Setup

### 1. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Get your project URL and keys from Settings > API
3. Update `client/.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Update `server/.env`:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

### 2. Database Setup

#### Option A: Use Supabase PostgreSQL

1. Get your database connection string from Supabase Settings > Database
2. Update `server/.env`:
   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally or use Docker
2. Create database:
   ```bash
   createdb isometric_rpg
   ```
3. Update `server/.env` with your local connection string

### 3. Run Prisma Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate
```

## Development Workflow

### Starting the Application

```bash
# Start both client and server
npm run dev
```

Or use the convenience script:

```bash
./start-dev.sh
```

### Accessing Services

- **Game Client**: Port 3000 (forwarded in Codespaces)
- **Game Server**: Port 2567 (forwarded in Codespaces)
- **Colyseus Monitor**: http://localhost:2567/colyseus
- **Prisma Studio**: `npm run prisma:studio`

### Making Changes

1. **Shared Types**: Edit `shared/src/` and rebuild with `npm run build --workspace=shared`
2. **Client**: Changes hot-reload automatically via Vite
3. **Server**: Changes hot-reload automatically via tsx watch

## Troubleshooting

### Dependencies Not Installing

Rebuild the dev container to ensure Node.js is installed:
- VS Code: Command Palette > "Dev Containers: Rebuild Container"
- Codespaces: Rebuild from settings

### Prisma Client Not Found

```bash
npm run prisma:generate
```

### Port Already in Use

Kill existing processes:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:2567 | xargs kill -9
```

### Supabase Connection Issues

- Verify credentials in `.env` files
- Check Supabase project is active
- Ensure API keys are correct

## Project Structure Details

### Client (`client/`)
- Phaser 4 game engine
- Vite for fast development and building
- Colyseus client for multiplayer
- Supabase client for authentication

### Server (`server/`)
- Colyseus server for real-time multiplayer
- Express for HTTP endpoints
- Prisma for database access
- Supabase for authentication verification

### Shared (`shared/`)
- Common types and interfaces
- Game constants
- Utility functions
- Used by both client and server

### Database (`prisma/`)
- Prisma schema defining data models
- User, Character, Item, and Inventory tables
- Migrations for version control

## Next Development Steps

1. **Authentication Flow**
   - Implement login/register UI
   - Connect to Supabase Auth
   - Store user sessions

2. **Character Creation**
   - Character creation screen
   - Save to database via Prisma
   - Load character on game start

3. **Game Mechanics**
   - Implement movement on isometric grid
   - Add collision detection
   - Implement combat system

4. **Assets**
   - Add character sprites
   - Add tile graphics
   - Add UI elements

5. **Multiplayer**
   - Sync player positions
   - Implement chat system
   - Add player interactions

## Resources

- [Phaser 4 Documentation](https://phaser.io/phaser4)
- [Colyseus Documentation](https://docs.colyseus.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
