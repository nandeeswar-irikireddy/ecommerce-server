import { pool } from "../db";
import { hashPassword, signJwtoken } from "../utils/auth-utils";
import { DBUserRow, User } from "../types/user";
import { mapDBUserRowToUser } from "../mappers/user-mapper";
import bcrypt from 'bcrypt'
import { AUTH_ERRORS } from "../constants/auth-constants";

interface AuthResult {
    user: User;
    token: string;
}

export async function createUser(userName: string, email: string, password: string): Promise<AuthResult> {
    const client = await pool.connect()
    try {
        const hashedPassword = await hashPassword(password) 

        await client.query("BEGIN")

        const userResult = await client.query<DBUserRow>(`
            INSERT INTO USERS (name, email, password_hash)
            VALUES($1, $2, $3)
            RETURNING id, name, email, email_verified, created_at
        `,[userName, email, hashedPassword])

        await client.query("COMMIT")

        const userRow = userResult?.rows?.[0]

        if(!userRow) {
            throw new Error(AUTH_ERRORS.USER_CREATION_FAILED);
        }

        const user = mapDBUserRowToUser(userRow)

        const token = signJwtoken(user)

        return {
            user,
            token
        }
        
    } catch(error) {
        await client.query("ROLLBACK")
        throw error;
    } finally {
        client.release()
    }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
    const client = await pool.connect()
    try {

        const userResult = await client.query<DBUserRow>(`
            SELECT id, name, email, email_verified, created_at, password_hash
            FROM USERS
            WHERE email = $1
        `, [email])

        const userRow = userResult?.rows?.[0]

        if(!userRow) {
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
        }

        const isMatch = await bcrypt.compare(password, userRow.password_hash)

        if(!isMatch) {
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
        }

        const user = mapDBUserRowToUser(userRow)

        const token = signJwtoken(user)

        return {
            user,
            token
        }
    } catch(error) {
        throw error;
    } finally {
        client.release()
    }
}

