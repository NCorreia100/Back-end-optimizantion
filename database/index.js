const { MongoClient } = require('mongodb');
const {MAPBOX_TOKEN} = require('../config');
const URLsFile = require('../database/sample-data/sampleData.json');
const {connectionStr,connectionParams,dbName,colName} = require('./config');


module.exports.getCarouselImages = (listingId, callback) => {
    console.log('listing requested: ',listingId);
    MongoClient.connect(connectionStr,connectionParams, (err, client) => {
            if (err) console.log('error connecting to DB')

            const db = client.db(dbName);
            const collection = db.collection(colName);

            let batchId = Math.floor(listingId/1000000);
            let batchListing = listingId%1000000;
            console.log('Batch: #'+batchId+'; Record on batch: #'+batchListing);

            collection.findOne({'_id':batchId}, (err, data) => {
                if (err) callback(err)
                else {                    
                    let targetDoc = data.bundle.split('~')[batchListing];                             
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