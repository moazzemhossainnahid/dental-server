const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());



// Get JWT Token

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'UnAuthorized Aceess'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Forbidden Access'})
        }
        // console.log('decoded', decoded);
        req.decoded = decoded;
    })
    // console.log('Inside VerifyJWT',authHeader);
    next();
}

  


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hmmg8.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://imtiaz16549:XD5OSllQJu3uac2N@cluster0.0x8fuae.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        await client.connect();
        const usersCollection = client.db("Dental").collection("Users");
        const doctorsCollection = client.db("Dental").collection("Doctors");
        const appointmentsCollection = client.db("Dental").collection("Appointments");

        // get doctors
        app.get('/doctors', async(req, res) => {
            const query = {};
            const doctors = doctorsCollection.find(query);
            const result = await doctors.toArray();
            res.send(result);
        })

        // get doctor by id
        app.get('/doctor/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const doctor = await doctorsCollection.findOne(query);
            res.send(doctor);
        })

        // post doctor
        app.post('/doctor', verifyToken, async(req, res) => {
            const doctor = req.body;
            const result = await doctorsCollection.insertOne(doctor);
            res.send(result)
        })

                
        // update doctor
        app.put('/updatedoctor/:id', verifyToken, async(req, res)=> {
            const id = req.params.id;
            const doctor = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert : true};
            const updatedDoc = {
                $set: doctor,
            };
            const result = await doctorsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

        // delete doctor
        app.delete('/doctor/:id', verifyToken, async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await doctorsCollection.deleteOne(query);
            res.send(result);
        })

        // get doctors
        app.get('/appointments', async(req, res) => {
            const query = {};
            const doctors = appointmentsCollection.find(query);
            const result = await doctors.toArray();
            res.send(result);
        })

        // get doctor by id
        app.get('/appointment/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const doctor = await appointmentsCollection.findOne(query);
            res.send(doctor);
        })

        // post doctor
        app.post('/appointment', async(req, res) => {
            const doctor = req.body;
            const result = await appointmentsCollection.insertOne(doctor);
            res.send(result)
        })

                
        // update doctor
        app.put('/updateappointment/:id', async(req, res)=> {
            const id = req.params.id;
            const doctor = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert : true};
            const updatedDoc = {
                $set: doctor,
            };
            const result = await appointmentsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

        // delete doctor
        app.delete('/appointment/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await appointmentsCollection.deleteOne(query);
            res.send(result);
        })

 
        // Post Admin Role
        app.put('/user/admin/:email', verifyToken, async(req, res)=> {
            const email = req.params.email;
            const requester = req.decoded?.email;
            const recuesteraccount = await usersCollection.findOne({email: requester});
            if(recuesteraccount.role === 'admin'){
                const filter = {email: email};
                const updatedDoc = {
                    $set: {role: 'admin'},
                };
                const result = await usersCollection.updateOne(filter, updatedDoc);
                res.send(result);
            }else{
                return res.status(403).send({message: 'Forbidden Aceess'})
            }

        })

                   
        
        // Remove Admin
        app.put('/user/removeadmin/:email', verifyToken, async(req, res)=> {
            const email = req.params.email;
            const filter = {email: email};
            const updatedDoc = {
                $set: {role: ''},
            };
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result);

        })

 
        // get admin
        app.get('/user/admin/:email', verifyToken, async(req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin});
        })


        // Post user by email
        app.put('/user/:email', async(req, res)=> {
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert : true};
            const updatedDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({result, accessToken: token});

        })
 
 
        // get users
        app.get('/users', verifyToken, async(req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        })

        
        // delete user
        app.delete('/removeuser/:email', verifyToken, async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })


        // post profile by email
        app.put('/profile/:email', verifyToken, async(req, res) => {
            const email = req.params.email;
            const profile = req.body;
            const filter = {email: email};
            const options = {upsert : true};
            const updatedDoc = {
                $set: profile,
            };
            const result = await profilesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
  
        // get profile by email
        app.get('/profile/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email}
            const profile = await profilesCollection.findOne(query);
            res.send(profile);
        })

    }finally{

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Running Dental Server");
});

app.listen(port, () => {
    console.log("Listen to Port", port);
})