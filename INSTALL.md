# Installation & First Run

## Prerequisites

The dev container includes:
- Node.js 20
- TypeScript
- PostgreSQL client
- Global packages: concurrently, tsx, prisma

## Step-by-Step Installation

### 1. Rebuild Dev Container (if needed)

If Node.js is not available, rebuild the container:

**In VS Code:**
- Press `F1` or `Ctrl+Shift+P`
- Type "Dev Containers: Rebuild Container"
- Wait for rebuild to complete

**In GitHub Codespaces:**
- Click the gear icon in bottom left
- Select "Rebuild Container"

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (client, server, shared).

### 3. Build Shared Package

The shared package must be built before starting the servers:

```bash
npm run build --workspace=shared
```

### 4. Configure Environment Variables

#### Client Configuration

Edit `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Server Configuration

Edit `server/.env`:
```env
PORT=2567
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Database (use Supabase or local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 5. Set Up Database (Optional)

If using Prisma with a database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate
```

**Note:** You can skip this step initially and run the game without database persistence.

### 6. Start Development Servers

```bash
npm run dev
```

This starts:
- **Client** on port 3000 (Phaser game)
- **Server** on port 2567 (Colyseus)

Or use the convenience script:
```bash
./start-dev.sh
```

## Verification

### Check Client

1. Open the forwarded port 3000 in your browser
2. You should see the isometric grid
3. Open browser console (F12) - should see "🎮 Isometric RPG Client Started"

### Check Server

1. Visit port 2567 in browser - should see Colyseus response
2. Visit http://localhost:2567/health - should return `{"status":"ok"}`
3. Visit http://localhost:2567/colyseus - Colyseus monitor dashboard

### Check Console Output

Server console should show:
```
🚀 Game server listening on port 2567
📊 Colyseus monitor available at http://localhost:2567/colyseus
```

Client console should show:
```
🎮 Isometric RPG Client Started
```

## Common Issues

### "npm: not found"

The dev container needs to be rebuilt with the updated Dockerfile.

**Solution:** Rebuild the dev container (see Step 1)

### "Cannot find module 'shared'"

The shared package hasn't been built yet.

**Solution:**
```bash
npm run build --workspace=shared
```

### "Prisma Client not found"

Prisma client needs to be generated.

**Solution:**
```bash
npm run prisma:generate
```

### Ports Not Accessible

Ports should be automatically forwarded in Codespaces/VS Code.

**Check:**
- VS Code: View > Terminal > Ports tab
- Codespaces: Ports panel in bottom toolbar

**Manual forward:**
- Add ports 3000 and 2567 if not listed

### Connection Refused on Server

Server might not be running or port is wrong.

**Check:**
```bash
# See if server is running
lsof -i :2567

# Check server logs
npm run dev:server
```

## Development Workflow

### Making Changes

**Client (Phaser):**
- Edit files in `client/src/`
- Changes hot-reload automatically
- Refresh browser to see updates

**Server (Colyseus):**
- Edit files in `server/src/`
- Server restarts automatically (tsx watch)
- Reconnect client if needed

**Shared:**
- Edit files in `shared/src/`
- Rebuild: `npm run build --workspace=shared`
- Restart both client and server

### Running Individual Services

```bash
# Client only
npm run dev:client

# Server only
npm run dev:server
```

### Database Management

```bash
# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
cd server && npx prisma migrate reset
```

## Next Steps

1. ✅ Verify installation works
2. Configure Supabase credentials
3. Set up database connection
4. Run Prisma migrations
5. Start building game features!

See `SETUP.md` for detailed configuration and `README.md` for project overview.
