//////+++Database Transactions+++//////

//Import dependencies
//
const { MongoClient } = require('mongodb');
const { MAPBOX_TOKEN } = require('../config');
const URLsFile = require('../database/sample-data/mockData.json');
const { connectionStr, connectionParams, dbName, colName } = require('./config');

//Retrieve photo-URLs from database
//  
module.exports.getCarouselImages = (listing, callback) => {
    let listingId = listing - 1;  //adjusted for array indexing

    //mongo/s instance: connectionStr is the database URI, connectionPArams are the instantiation options 
    MongoClient.connect(connectionStr, connectionParams, (err, client) => {
        if (err) console.log('error connecting to DB')

        //URI, options, db name and collection name imported from database/config.js file, Mapbox token imported from project config.js
        const db = client.db(dbName);
        const collection = db.collection(colName);

        //all listing photos are bundled into 1000 batches, first batch has an id of 1
        let batchId = Math.floor(listingId / 1000) + 1;
        let batchListing = listingId % 1000;
        console.log('Batch: #' + batchId + '; Batch index ' + batchListing);

        //quering the database using the batch id as filter argument
        let time = Date.now()
        collection.findOne({ 'batchId': batchId }, (err, data) => {
            if (err) callback(err)
            else {
                console.log('reading OP time: ', Date.now() - time)
                //on success de-concatenate bundled listing records and resolve target listing
                let targetDoc = data.bundle.split('~')[batchListing];

                let randomNum = parseInt(targetDoc.substring(11, 13));
                if (isNaN(randomNum)) {
                    randomNum = parseInt(targetDoc.substring(11, 12));
                }

                let URLs = {};
                for (let i in URLsFile) {
                    if (i === 'map') URLs[i] = URLsFile[i][randomNum] + MAPBOX_TOKEN;
                    else URLs[i] = URLsFile[i][randomNum] || null;
                }
                console.log(URLs)
                //read from File containing all URLs and assign key-value pairs to URLs object
                callback(null, URLs);
            }
        })
    });
}