import { pool } from "../db";
import { hashPassword } from "../utils/auth-utils";
import { DBUserRow, User } from "../types/user";
import { mapDBUserRowToUser } from "../mappers/user-mapper";


export async function createUser(userName: string, email: string, password: string): Promise<User> {
    const client = await pool.connect()
    try {
        const hashedPassword = await hashPassword(password) 

        await client.query("BEGIN")

        const userResult = await client.query<DBUserRow>(`
            INSERT INTO USERS (user_name, email, password_hash)
            VALUES($1, $2, $3)
            RETURNING id, user_name, email, email_verified, created_at
        `,[userName, email, hashedPassword])

        await client.query("COMMIT")

        if(!userResult.rows[0]) {
            throw new Error("User creation failed")
        }

        return mapDBUserRowToUser(userResult.rows[0])
        
    } catch(error) {
        await client.query("ROLLBACK")
        throw error;
    } finally {
        client.release()
    }
}