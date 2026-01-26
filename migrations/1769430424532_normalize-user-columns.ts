import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameColumn("users", "userName", "user_name");
  pgm.renameColumn("users", "passwordHash", "password_hash");
  pgm.renameColumn("users", "emailVerified", "email_verified");
  pgm.renameColumn("users", "createdAt", "created_at");
}
