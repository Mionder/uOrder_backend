// prisma.config.ts
import { defineConfig } from '@prisma/config'; // або за структурою твого проекту

export default defineConfig({
  datasource: {
    //url: process.env.DATABASE_URL,
    url: "postgresql://postgres.wpvvkawgqojdglynjloz:lWInGP1ta7Oi3vJo@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    // "postgresql://postgres.wpvvkawgqojdglynjloz:lWInGP1ta7Oi3vJo@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  },
  //
 // postgresql://postgres:[lWInGP1ta7Oi3vJo]@db.wpvvkawgqojdglynjloz.supabase.co:5432/postgres
 // 
});