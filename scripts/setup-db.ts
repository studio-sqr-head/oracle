import "dotenv/config";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

// Extract project ID from URL
const projectId = supabaseUrl.split("//")[1].split(".")[0];

async function runMigration() {
  console.log("🚀 Setting up database schema...\n");

  // Try method 1: If password is provided, use direct PostgreSQL connection
  if (dbPassword) {
    console.log("📋 Method 1: Direct PostgreSQL connection");
    await runViaPostgres(projectId, dbPassword);
    return;
  }

  // Try method 2: Check if Supabase CLI is available
  console.log("📋 Checking for Supabase CLI...");
  try {
    execSync("supabase --version", { stdio: "ignore" });
    console.log("✓ Supabase CLI found\n");
    await runViaSuperbaseCliDirect();
    return;
  } catch (e) {
    console.log("ℹ️  Supabase CLI not found\n");
  }

  // Fallback: Show instructions and wait for manual setup or password
  showManualInstructions();
}

async function runViaPostgres(projectId: string, password: string) {
  try {
    const connectionString = `postgresql://postgres:${password}@db.${projectId}.supabase.co:5432/postgres`;

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();

    try {
      const migrationPath = join(process.cwd(), "migrations", "001_create_tables.sql");
      const migrationSQL = readFileSync(migrationPath, "utf-8");

      console.log("📝 Executing migration SQL...\n");

      await client.query("BEGIN");
      await client.query(migrationSQL);
      await client.query("COMMIT");

      console.log("✨ Migration completed successfully!\n");
      console.log("✓ reports table created");
      console.log("✓ synthesis table created");
      console.log("✓ RLS policies enabled on both tables\n");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    showManualInstructions();
  }
}

async function runViaSuperbaseCliDirect() {
  try {
    console.log("📝 Running migrations via Supabase CLI...\n");

    const migrationPath = join(process.cwd(), "migrations", "001_create_tables.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // Create a temporary migration file
    const tmpPath = "/tmp/migration.sql";
    execSync(`cat > ${tmpPath} << 'EOF'\n${migrationSQL}\nEOF`);

    // Try to execute via psql through Supabase
    execSync(`supabase db push`, { stdio: "inherit" });

    console.log("\n✨ Migration completed successfully!\n");
  } catch (error) {
    console.error("❌ Supabase CLI execution failed");
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log("\n📖 To complete setup, add your database password:\n");
  console.log(
    "Option 1: Add to .env.local (get from Supabase Settings → Database)\n"
  );
  console.log("  SUPABASE_DB_PASSWORD=your_postgres_password\n");
  console.log("  Then run: npm run setup:db\n");

  console.log("Option 2: Use Supabase Dashboard (no CLI needed)\n");
  console.log("  1. Go to: " + supabaseUrl + "/project/_/sql");
  console.log("  2. Click 'New Query'");
  console.log("  3. Copy content from: migrations/001_create_tables.sql");
  console.log("  4. Paste and click 'Run'\n");

  console.log("Option 3: Use Supabase CLI\n");
  console.log("  1. Install: npm install -g supabase");
  console.log("  2. Login: supabase login");
  console.log("  3. Link: supabase link --project-ref " + projectId);
  console.log("  4. Run: npm run setup:db\n");
}

runMigration();
