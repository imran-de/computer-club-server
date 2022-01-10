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
        const teachersCollection = database.collection('teachers');
        const studentsCollection = database.collection('students');
        const executivesCollection = database.collection('executive');
        const resultCollection = database.collection('result');
        /************************
         * all about users API
         *************************/
        // all users
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find({}).toArray();
            res.json(users);
        })
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
        /**************************
        //all about department API
        ***************************/
        //get all teachers
        app.get('/teachers', async (red, res) => {
            const teachers = await teachersCollection.find({}).toArray();
            res.json(teachers);
        })
        //add teacher
        app.post('/add-teacher', async (req, res) => {
            const teacher = req.body;
            const result = await teachersCollection.insertOne(teacher);
            res.json(result);
        })
        //get all student
        app.get('/students', async (red, res) => {
            const students = await studentsCollection.find({}).toArray();
            res.json(students);
        })
        //add teacher
        app.post('/add-student', async (req, res) => {
            const student = req.body;
            const result = await studentsCollection.insertOne(student);
            res.json(result);
        })
        /*******************
         * All about executive API
         ******************/
        //get all executive
        app.get('/executives', async (req, res) => {
            const executives = await executivesCollection.find({}).sort({ _id: -1 }).toArray();
            res.json(executives);
        })
        //add executive
        app.post('/add-executive', async (req, res) => {
            const executive = req.body;
            const result = await executivesCollection.insertOne(executive);
            res.json(result);
        })
        /****************
         * all about results
         *****************/
        // all result
        app.get('/results', async (req, res) => {
            const results = await resultCollection.find({}).sort({ _id: -1 }).toArray();
            res.json(results);
        })
        //add result
        app.post('/add-result', async (req, res) => {
            const result = req.body;
            const insert = await resultCollection.insertOne(result);
            res.json(insert);
        })

        //make admin api
        app.post('/users/make-admin', async (req, res) => {
            const email = req?.body?.email;

            const filter = { email: email };
            const updateDoc = { $set: { role: 'admin' } };
            const user = await usersCollection.findOne(filter);

            if (user?.role === 'admin') {
                res.json({ message: "The user already have admin access, no need to make admin again", from: 'alreadyAdmin' });
            } else if (user === null) {
                res.json({ message: "The user not found! check email and try again", from: 'noEmail' });
            } else {
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.json(result);
            }
        });

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
