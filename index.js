const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config()
const PORT = process.env.PORT
const uri = process.env.MONGODB_URI



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
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
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