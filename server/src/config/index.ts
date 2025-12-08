export interface ServerConfig {
  port: number;
  databaseUrl: string;
  directDatabaseUrl?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
}

const cfg: ServerConfig = {
  port: Number(process.env.PORT || process.env.SERVER_PORT || 2567),
  databaseUrl: process.env.DATABASE_URL || '',
  directDatabaseUrl: process.env.DIRECT_URL || undefined,
  supabaseUrl: process.env.SUPABASE_URL || undefined,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || undefined,
};

export default cfg;
