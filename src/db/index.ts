import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";

//const connectionString = "postgres://postgres.nqyptxiryekuqkmhijmp:m6I6VCKrAj6gcPrI@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";
const connectionString = "postgres://postgres.kbzhvrycpgvwctdynigc:m6I6VCKrAj6gcPrI@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";
export const sql = postgres(process.env.DB_CONNECTION_STRING);
export const db = drizzle(sql, { logger: true, schema });
