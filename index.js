const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, MongoRuntimeError } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//connect mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5okll.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// database connect and operation
async function run() {
    try {
        await client.connect();
        //make database and table collection
        const database = client.db("computer-club");
        const noticeCollection = database.collection('notice');
        const usersCollection = database.collection('users');

        //post user data
        app.post('/user', async (req, res) => {
            const data = req.body;
            const result = await usersCollection.insertOne(data);
            res.json(result);
        })

        //update or put user. if user already exist ignore 
        app.put('/user', async (req, res) => {
            const data = req.body;
            const filter = { email: data.email };
            const options = { upsert: true };
            const updateDoc = { $set: data };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        })

        //get user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.json(user);
        })

        //get single notice api
        app.get('/notice/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: ObjectId(id) };
            const result = await noticeCollection.findOne(query);
            res.json(result);
        })
        //**------------Notice operation------------------ */
        // add/ post notice
        app.post('/add-notice', async (req, res) => {
            const data = req.body;
            const result = await noticeCollection.insertOne(data);
            res.json(result);
        })
        //get all notice
        app.get('/all-notice', async (req, res) => {
            const result = await noticeCollection.find({}).sort({ _id: -1 }).toArray();
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('The Computer Club Server running perfectly!! cheers!')
});

app.listen(port, () => {
    console.log('listening form port', port);
})
