const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
require('dotenv').config()
const PORT = process.env.PORT
const uri = process.env.MONGODB_URI


app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const jWKS = createRemoteJWKSet(
    new URL('http://localhost:3000/api/auth/jwks')
)

const vrifyToken = async (req, res, next) => {

    const authHader = req?.headers.authorization
    if (!authHader) {
        return res.status(401).json({ meassage: 'unauthorizte' })
    }
    const token = authHader.split(" ")[1]
    if (!token) {
        return res.status(403).json({ meassage: 'unauthorizte' })
    }


    try {
        const { payload } = await jwtVerify(token, jWKS)
        console.log(payload);

        next()
    } catch (e) {
        return res.status(401).json({ meassage: 'Forbiden' })
    }

}




const run = async () => {
    try {

        await client.connect();
        await client.db('admin').command({ ping: 1 })

        const database = client.db('wanderlust')
        const wanderlustcollaction = database.collection('wanderlustcollaction')
        const wanderlustBooking = database.collection('booking')


        app.post('/destination', async (req, res) => {
            const docs = req.body


            const result = await wanderlustcollaction.insertOne(docs)
            res.send(result)
        })

        app.get('/destination', async (req, res) => {
            const cursor = await wanderlustcollaction.find().toArray()
            res.send(cursor)
        })

        app.get('/destination/:id', vrifyToken, async (req, res) => {
            const id = req.params.id
            const query = {
                _id: new ObjectId(id)
            }
            const result = await wanderlustcollaction.findOne(query)
            res.send(result)
        })

        app.patch('/destination/:id', async (req, res) => {
            const id = req.params.id
            const filter = {
                _id: new ObjectId(id)
            }
            const docs = req.body

            const result = await wanderlustcollaction.updateOne(filter, { $set: docs })

            res.send(result)
        })


        app.post('/booking', async (req, res) => {
            const docs = req.body

            const result = await wanderlustBooking.insertOne(docs)
            res.send(result)
        })

        app.get('/booking/:userId', async (req, res) => {
            const { userId } = req.params
            const result = await wanderlustBooking.find({ userId: userId }).toArray()
            res.send(result)
        })

        app.delete('/booking/:bookingId', async (req, res) => {
            const { bookingId } = req.params
            const filter = {
                _id: new ObjectId(bookingId)
            }
            const result = await wanderlustBooking.deleteOne(filter)
            res.send(result)
        })

        app.delete('/destination/:id', async (req, res) => {
            const id = req.params.id
            const filter = {
                _id: new ObjectId(id)
            }
            const result = await wanderlustcollaction.deleteOne(filter)
            res.send(result)
        })


    } finally {
        //    await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('server is runing')
})


app.listen(PORT, () => {
    console.log(`Server is runing on port ${PORT}`);

})