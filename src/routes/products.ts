import { Router, Request, Response } from "express";

const router = Router()

router.get('/:id', (req: Request, res: Response) => {
    const productId = req.params.id
    res.status(200).json(
        {
            id: productId,
            name: 'Product - 1',
            price: '300',
            description: 'product 1'
        }
    )
})

export default router