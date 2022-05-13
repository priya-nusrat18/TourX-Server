const express = require('express')
const app = express()
const cors=require('cors')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')
const { MongoClient , ObjectId } = require('mongodb');

const port = process.env.PORT || 5000
require('dotenv').config();

app.use(cors())
app.use(bodyParser.json())
app.use(fileupload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1msfu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`


app.get('/', (req, res) => {
    res.send('Hello, from TourX server!')
  })

  

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const packageCollection = client.db("tourX").collection("package");
  const orderCollection = client.db("tourX").collection("orders");
  const adminCollection = client.db("tourX").collection("admin");
  const reviewCollection = client.db("tourX").collection("review");


//add o package and image upload 
app.post('/addPackage' , (req,res)=>{
        const package = req.body;
        console.log(package);
        packageCollection.insertOne(package)
        .then(result =>{
            res.send(result.insertedCount > 0)
        })
    })

    // Show all package
    app.get('/showPackage', (req, res) => {
      packageCollection.find({})
          .toArray((err, documents) => {
              res.send(documents)
          })
  })

   // delete package
   app.delete('/deletePackage/:id', (req, res) => {
    const id = ObjectId(req.params.id)
    packageCollection?.deleteOne({
        _id: id
    })
        .then(result => {
            res.send(result.deletedCount > 0)
        })
})
//----find single product by id ---//
app.get('/package/:id',(req,res) => {
  const id = ObjectId(req.params.id)
  // console.log('id',id);
  packageCollection.find({_id: id})
  .toArray((err, documents) => {
      res.send(documents[0])
  })
})

//----post for book --- //
app.post('/addOrder' , (req,res)=>{
  const allBookData = req.body;
  // console.log(allBookData);
  orderCollection.insertOne(allBookData)
  .then( result => {
    res.send(result.insertedCount  > 0)
  })

})

// make admin
app.post('/makeAdmin', (req, res) => {
  const adminInfo = req.body;
  // console.log(adminInfo);
  adminCollection.insertOne(adminInfo)
      .then(result => {
          console.log(result.insertedCount);
          res.send(result.insertedCount > 0)
      })
})

// show book and order list

app.post('/showBookList', (req, res) => {
  const email = req.body.email;
  // console.log(" list email", email);
  adminCollection.find({ email: email })
      .toArray((err, admin) => {
          const filter = {};
          if (admin.length === 0) {
              filter.email = email
          }
          orderCollection.find(filter)
              .toArray((err, documents) => {
                  res.send(documents)
              })
      })
})
// update status
app.patch('/updateStatus', (req, res) => {

  const serviceId = ObjectId(req.body.updateId);
  const status = req.body.status;
  console.log("Update", serviceId, status);
  orderCollection.updateOne({ _id: serviceId },
      {
          $set: { status: status },
          $currentDate: { 'lastModified': true }
      })

      .then(result => {
          console.log(result);
          res.send(result.modifiedCount > 0)
      })
      .catch(err => console.log('err', err))

})

  // is admin or not
   app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    // console.log(email);
    adminCollection.find({ email: email })
        .toArray((err, admin) => {
            res.send(admin.length > 0)
        })
})


  // add review
  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
        .then(result => {
            console.log(result.insertedCount);
            res.send(result.insertedCount > 0)
        })
})

// show review
app.get('/showReview', (req, res) => {
    reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
})
  console.log('mongodb-connected successfully');
//   client.close();
});


  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
