import { Router } from "express";
import { signup } from "../controllers/auth-controller";

const router = Router();

router.post('/signup', (req, res) => {
    signup(req, res);
});

export default router;