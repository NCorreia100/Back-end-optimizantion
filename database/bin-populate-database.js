////////////////////////////////////////////////////////
//
//    Script to Generate Mock Data

//import db connection and schema

const { MongoClient } = require('mongodb');
const {connectionStr,connectionParams,dbName,colName} = require('./config');

//dclare const va

const TARGET_RECORDS = 10000000 //10M change this value to generate that number of records
const BATCH_QTY = 10;         //change this to divide the total number of records to batches of equal size
const timeInit = Date.now();


////////////////////////////////////////

// Produce a single listing
const generateListing = () => {
//format: {file: index}
//exterior, apartment,map,kitchen, bedroom,bathroom,livingroom,
  return `"{'index':'${Math.floor(Math.random()*17)}'}"`;
};

let batchNum = 1;
//create a batch of listings
const getWritingOps = (num) => {
  let counter = 0;
  let batch = [];
  while (counter < num) {
    let docStr='';      
    do{      
      docStr+=generateListing(counter)+'~';
      counter++;     
    } while(counter%1000!==0);    
    batch.push(docStr);
  }
  console.log('batch in: #'+ batchNum+ ' ready! | Time: '+ Math.round(Date.now() - timeInit)+ ' | Records Qty: '+counter)
  batchNum++;
  return batch.map(doc=>({'insertOne':{'_id':batchNum-1,'bundle':doc}}));
}


const insertDocuments = (db, callback) => {
  // Get the documents collection
  const collection = db.collection(colName);
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


let outputBatch = 1;

MongoClient.connect(connectionStr,connectionParams, (err, client) => {
  if (err) console.log('error connecting to DB')

  const db = client.db(dbName);

  insertDocuments(db, function (result) {
    console.log('batch out #:', outputBatch, ' ,Time: ', Math.round((Date.now() - timeInit) / 1000), 's');
    outputBatch++;
  });

});

