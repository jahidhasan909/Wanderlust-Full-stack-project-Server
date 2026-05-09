const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
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


const run = async () => {
    try {

        await client.connect();
        await client.db('admin').command({ ping: 1 })

        const database = client.db('wanderlust')
        const wanderlustcollaction = database.collection('wanderlustcollaction')


        app.post('/destination', async (req, res) => {
            const docs = req.body
            

            const result = await wanderlustcollaction.insertOne(docs)
            res.send(result)
        })

        app.get('/destination', async (req, res) => {
            const cursor = await wanderlustcollaction.find().toArray()
            res.send(cursor)
        })

        app.get('/destination/:id', async (req, res) => {
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
            
            const result = await wanderlustcollaction.updateOne(filter, {$set:docs})
          
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