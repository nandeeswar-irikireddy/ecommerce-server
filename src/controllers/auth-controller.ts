import { signupSchema } from "../schemas/auth-schema";
import { Request, Response } from "express";
import { createUser } from "../services/auth-service";
import { DatabaseError } from "pg";

export async function signup(req: Request, res: Response) {
    try {
        
        const parsed = signupSchema.safeParse(req.body);
        if(!parsed.success) {
            return res.status(400).json({
                errors: parsed.error.flatten().fieldErrors
            })
        }

        const {userName, email, password} = parsed.data;

        const user= await createUser(userName, email, password);

        return res.status(201).json({
            message: "User created successfully",
            user
        })

    } catch(error) {

        if(error instanceof DatabaseError && error.code === '23505') {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}