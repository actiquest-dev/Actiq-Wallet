import type { Config } from "drizzle-kit";

export default {
    schema: "./db/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        database: "postgres",
        host: "aws-0-eu-central-1.pooler.supabase.com",
        port: 5432,
        //user: "postgres.nqyptxiryekuqkmhijmp",
        user: 'postgres.kbzhvrycpgvwctdynigc',
        password: "m6I6VCKrAj6gcPrI",
  },
} satisfies Config;
