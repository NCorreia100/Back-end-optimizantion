////////////////////////////////////////////////////////
//
//    Script to Generate Mock Data

//import db connection and schema

const { MongoClient } = require('mongodb');
const {AWS_URL} = require('../config');

//declare const vars

const TARGET_RECORDS = 5000000 //10M change this value to generate that number of records
const BATCH_QTY = 10;         //change this to divide the total number of records to batches of equal size
const timeInit = Date.now();

////////////////////////////////////////

//generate a random index for getting file reference
const getRandomInt = (length) => Math.floor(Math.random() * length);


// Produce a single listing
const generateListing = (id) => {
  //format: {filepath: index on binArray}
  return `{
    'id': ${id},
    'imgs': {
      'map': getRandomInt(17),
      'floorPlan': getRandomInt(6),
      'exterior': getRandomInt(24),
      'kitchen': getRandomInt(20),
      'bedroom': getRandomInt(22),
      'bathroom': getRandomInt(23),
      'livingroom': getRandomInt(24),
      'amenities': getRandomInt(29)
    }
  }`;
};

let batchNum = 0;
//create a batch of listings
const getWritingOps = (num) => {
  let counter = 0;
  let batch = [];
  while (counter < num) {
    let docStr='';      
    do{      
      docStr+=generateListing(counter)+'~';
      counter++;     
    } while(counter%1000!==1);    
    batch.push({docStr});
  }
  console.log('batch in #:', batchNum, ' is ready! Time: ', Math.round(Date.now() - timeInit))
  batchNum++;
  return batch.map(doc=>({'insertOne':{_id:batchNum,doc}}));
}


const insertDocuments = (db, callback) => {
  // Get the documents collection
  const collection = db.collection('listingImages');
  // Insert some documents
  let counter = 0;
  while (counter < BATCH_QTY) {
    collection.bulkWrite(getWritingOps(TARGET_RECORDS/BATCH_QTY,{ordered:false}), function (err, result) {
      if (err) console.log('error inserting: ', err)
      callback(result);
    });
    counter++;
  }
  }

 
const connectionPArams = {
  useNewUrlParser: true,
  fsync: false,
  w: 0,
  j: false,
  bufferMaxEntries: -1,
  poolSize: BATCH_QTY  
}





let outputBatch = 1;

MongoClient.connect(
  `mongodb://${AWS_URL}:27017`, 
  connectionPArams, (err, client) => {
  if (err) console.log('error connecting to DB')

  const db = client.db('listingImages');

  insertDocuments(db, function (result) {
    console.log('batch out #:', outputBatch, ' ,Time: ', Math.round((Date.now() - timeInit) / 1000), 's');
    outputBatch++;
  });

});


