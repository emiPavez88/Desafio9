const { Router } = require('express')
const faker = require('faker')
faker.locale = 'es'

function randomValue() {
    return { value: {
        title: faker.commerce.product(),
        price: faker.commerce.price(),
        thumbnail: `${faker.image.imageUrl()}?random=${Date.now()}`
        }
    }
}

const mockRouter = new Router()

mockRouter.get('/', async (req, res) => {
    const products = []
    for (let i = 0; i < 5; i++) {
        products.push(randomValue())
    }
    res.json(products)
})

module.exports = { mockRouter }