import { DBUserRow, User } from "../types/user";

export function mapDBUserRowToUser(dbRow: DBUserRow): User {
    return {
        id: dbRow.id,
        name: dbRow.name,
        email: dbRow.email,
        emailVerified: dbRow.email_verified,
        createdAt: dbRow.created_at,
    };
}