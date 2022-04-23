/**
* PLOT is an app that lets you find and save your favourite crops.
* We use the OpenFarm API to find crop data. See also:
* https://github.com/openfarmcc/OpenFarm/blob/master/docs/api_docs.md 
* We use MongoDB to maintain a list of crops for each user.
*/ 

// get environment variables
require('dotenv').config() 

// SETUP MONGODB
const MONGODB_URI = process.env.MONGODB_URI 

// MongoDB Driver
const { MongoClient } = require('mongodb') 


// axios HTTP client https://www.npmjs.com/package/axios
const axios = require('axios');  

/* SETUP EXPRESS */
const express = require ('express')   // express framework 
const cors = require ('cors')         // Cross Origin Resource Sharing
const bodyParser = require('body-parser') // middleware to parse JSON data that is sent from the frontend.
const app = express(); // enable express
app.use( cors() ); // make express attach CORS headers to responses
// TODO: adjust settings for JSON 
app.use( express.json() ); // add json capabilities to our express app 

/* Serve up static assets, i.e. the Frontend of the site. */
app.use('/', express.static('public')) 

  
/** listen for users' searches from the frontend */
/** learned how to pass two parameters from https://stackoverflow.com/questions/15128849/using-multiple-parameters-in-url-in-express */
app.get('/search/:searchFilter/:searchAuthor', async (req,res) => { 
    const options = {
        method: 'GET',
        url: 'https://www.googleapis.com/books/v1/volumes',
        params: {
          key: process.env.API_KEY,
          q: req.params.searchFilter,
          inauthor: req.params.searchAuthor,
          maxResults: '6'
        }
      };
      
      axios.request(options).then(function (response) {
          console.log(response)
        res.send(  response.data ) 
      }).catch(function (error) {
        console.error(error);
      });
})

  

// Connect to MongoDB
// See also https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
.then(client =>{ 
    const myCollection = client.db("bookshelf").collection("bookshelves")

/** fetch a plot (list of crops) for a given farmer. */
app.get('/bookshelf', (req,res) => {   
    myCollection.findOne(
        { reader: req.query.reader  }, 
        (error, bookshelf)=>{
            /** If there is no result send a blank default plot. */
            if (error || bookshelf == null) {
                return res.send({
                    reader:req.query.reader, 
                    items: []
                })
            } 
            /** send the full data */
            res.send( bookshelf )
        }
    ) 
})

/** Add/update a plot for a given farmer. 
 * See also: https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/
 * Read more about update operators: 
 * https://www.mongodb.com/docs/manual/reference/operator/update/#update-operators  */
app.post( '/bookshelf', bodyParser.json(), (req,res) => { 
    myCollection.updateOne(
        {reader: req.body.redaer}, 
        {$set: { items : req.body.items } },  
        {upsert: true},  /** upsert = create if it doesnt exist. */
        (error) => { 
            if (error)  return res.send('Error') 
            res.send('Data saved')
        }
    )
})
 

}) 



/** Tell Express to start listening. */
const PORT = process.env.PORT || 5000  
app.listen(PORT, () => {
  console.log("We are live on port "+PORT )
})