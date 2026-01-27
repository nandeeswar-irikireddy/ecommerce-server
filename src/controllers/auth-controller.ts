import { loginSchema, signupSchema } from "../schemas/auth-schema";
import { Request, Response } from "express";
import { createUser, loginUser } from "../services/auth-service";
import { DatabaseError } from "pg";
import { AUTH_ERRORS, AUTH_MESSAGES } from "../constants/auth-constants";

export async function signup(req: Request, res: Response) {
    try {
        
        const parsed = signupSchema.safeParse(req.body);
        if(!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            })
        }

        const {userName, email, password} = parsed.data;

        const { user, token }= await createUser(userName, email, password);

        return res.status(201).json({
            message: AUTH_MESSAGES.USER_CREATED_SUCCESSFULLY,
            user,
            token
        })

    } catch(error) {

        if(error instanceof DatabaseError && error.code === '23505') {
            return res.status(409).json({
                message: AUTH_MESSAGES.USER_ALREADY_EXISTS
            });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export  async function login(req: Request, res: Response) {

    try{

        const parsedData = loginSchema.safeParse(req.body);

        if(!parsedData.success) {
            return res.status(400).json({
                errors: parsedData.error.flatten().fieldErrors
            })
        }

        const {email, password} = parsedData.data;

        const { user, token } = await loginUser(email, password);

        return res.status(200).json({
            message: AUTH_MESSAGES.LOGIN_SUCCESSFUL,
            user,
            token
        })
    } catch(error) {
        if(error instanceof Error && error.message === AUTH_ERRORS.INVALID_CREDENTIALS) {
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }
        res.status(500).json({ message: "Internal server error" });
    }
}