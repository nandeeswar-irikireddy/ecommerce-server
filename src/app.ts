import express, {Request, Response} from 'express'
import productsRouter from './routes/products'

const app = express()

app.get('/health',(req: Request,res: Response) => {
    res.status(200).json({
        status:'ok'
    })
})

app.use('/products',productsRouter)

export default app