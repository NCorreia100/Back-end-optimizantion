const { MongoClient } = require('mongodb');
const {MAPBOX_TOKEN} = require('../config');
const URLsFile = require('../database/sample-data/sampleData.json');
const {connectionStr,connectionParams,dbName,colName} = require('./config');


module.exports.getCarouselImages = (listing, callback) => {
    console.log('listing requested: ',listing);
    let listingId = listing-1;
    MongoClient.connect(connectionStr,connectionParams, (err, client) => {
            if (err) console.log('error connecting to DB')

            const db = client.db(dbName);
            const collection = db.collection(colName);

            let batchId = Math.floor(listingId/1000)+1;
            let batchListing = listingId%1000;
            console.log('Batch: #'+batchId+'; Batch index '+batchListing);

            collection.findOne({'batchId':batchId}, (err, data) => {
                if (err) callback(err)
                else {                    
                    let targetDoc = data.bundle.split('~')[batchListing];
                    console.log('target doc: ',targetDoc)                             
                    let randomNum = parseInt(targetDoc.substring(11,13));                   
                    if(isNaN(randomNum)){
                        randomNum = parseInt(targetDoc.substring(11,12)); 
                    }                        
                    let URLs = {};                                                           
                    for (let i in URLsFile) {
                        if(i==='map')   URLs[i] = URLsFile[i][randomNum]+MAPBOX_TOKEN;
                        else            URLs[i] = URLsFile[i][randomNum] || null;
                    }                   
                    callback(null, URLs);
                }
            })
        });
}