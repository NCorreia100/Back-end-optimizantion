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

            collection.findOne({}, (err, data) => {
                if (err) callback(err)
                else {                    
                    let targetDoc = data.bundle.split('~')[listingId];                  
                    console.log('doc requested: ', targetDoc);                    
                    let randomNum = parseInt(targetDoc.substring(11,13));                   
                    if(isNaN(randomNum)){
                        randomNum = parseInt(targetDoc.substring(11,12));                    }                    
                    console.log('index: ',randomNum);
                    let URLs = {};                                                           
                    for (let i in URLsFile) {
                        if(i==='map')   URLs[i] = URLsFile[i][randomNum]+MAPBOX_TOKEN;
                        else            URLs[i] = URLsFile[i][randomNum] || null;
                    }
                    console.log(URLs)
                    callback(null, URLs);
                }
            })
        });
}