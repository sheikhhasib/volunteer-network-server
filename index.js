const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
//middleware
app.use(bodyParser.json())
app.use(cors())


const admin = require("firebase-admin");

const serviceAccount = require("./configkeys/volunteer-network-36280-firebase-adminsdk-u5o1w-920f9ecd16.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-36280.firebaseio.com"
});



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1hh0e.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const volunteerCollection = client.db(process.env.DB_NAME).collection("volunteerDonetion");
  //addpatients
  app.post('/addDonetions', (req, res) => {
    const donetion = req.body;
    volunteerCollection.insertOne(donetion)
      .then(result => {
        res.send(true);
      })
  })

  // alldonets load 
  app.get('/allDonetions', (req, res) => {
    const bearer = req.headers.authorization;
    // console.log(bearer);
    if( bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      console.log({idToken});
      admin.auth().verifyIdToken(idToken)
      .then(function (decodedToken) {
        let tokenEmail = decodedToken.email;
        if(tokenEmail == req.query.email){
          volunteerCollection.find({ email: req.query.email })
          .toArray((err, documents) => {
            res.send(documents);
          })
        }
      }).catch(function (error) {

      });
    }
  })

  //delete patients
  app.delete('/donetionDelete/:id', (req, res) => {
    volunteerCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      })
  })
});



app.get('/', (req, res) => {
  res.send('Hello santo,please! work step by step .kaj kore na kno')
})

app.listen(process.env.PORT || port)