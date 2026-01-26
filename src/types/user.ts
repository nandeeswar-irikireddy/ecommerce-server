export interface User {
    id: number;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
}

export interface DBUserRow {
    id: number;
    name: string;
    email: string;
    email_verified: boolean;
    created_at: Date;
}