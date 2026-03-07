import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
    user?: User
}

interface User {
    id: string;
    role: string
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({
            error: "no token found"
        })
    }

    const token = authHeader.split(" ")[1]

    if(!token) {
        return res.status(401).json({
            error: "no token found"
        })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User

    req.user = decoded

    next()
    
    }
    catch(err) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        })
    }
}