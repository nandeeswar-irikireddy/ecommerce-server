import express, {Request, Response} from 'express'
import productsRouter from './routes/products'
import authRouter from './routes/auth'
import { rateLimiter } from './constants/middlewares/rate-limiter'
import { authenticate } from './constants/middlewares/authenticator'

const app = express()

app.use(express.json())

app.use(rateLimiter({
    windowMs: 60*60,
    max: 2
}))

app.use(authenticate)

app.get('/health',(req: Request,res: Response) => {
    res.status(200).json({
        status:'ok'
    })
})

app.use('/products',productsRouter)
app.use('/auth', authRouter)

export default app