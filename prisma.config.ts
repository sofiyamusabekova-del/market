import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_sample_pass@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
