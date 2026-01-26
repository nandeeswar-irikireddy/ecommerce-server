import express, {Request, Response} from 'express'
import productsRouter from './routes/products'
import authRouter from './routes/auth'

const app = express()

app.use(express.json())

app.get('/health',(req: Request,res: Response) => {
    res.status(200).json({
        status:'ok'
    })
})

app.use('/products',productsRouter)
app.use('/auth', authRouter)

export default app