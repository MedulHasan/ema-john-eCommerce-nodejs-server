const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6hb5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected');
        const database = client.db('ema_John_Shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        // get products
        app.get('/products', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = productCollection.find({});
            const count = await cursor.count();
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        });

        // use post to to get data by key
        app.post('/products/bykeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        // use post to get order
        app.post('/order', async (req, res) => {
            const order = req.body;
            order.createdAt = new Date();
            console.log(order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        app.get('/order', async (req, res) => {
            const { email } = req.query;
            let query = {};
            if (email) {
                query = {
                    email: email
                }
            }
            const order = orderCollection.find(query);
            const result = await order.toArray();
            res.json(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('ema-john is here');
})

app.listen(port, () => {
    console.log('Server is running on port ', port);
})