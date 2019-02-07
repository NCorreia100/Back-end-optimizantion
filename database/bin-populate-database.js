////////+++File with script to store mock data into DB+++/////////

//Import db connection and schema
//
const { MongoClient } = require('mongodb');
const {connectionStr,connectionParams,dbName,colName} = require('./config');

//Declare configuration variables
//
const TARGET_RECORDS = 10000000 //10M change this value to generate that number of records
const BATCH_QTY = 10;          //change this to divide the total number of records to batches of equal size
const timeInit = Date.now();  //start time counter

// Produce a single record
//
const generateListing = () => {
//format on FS: {file: index}
//exterior, apartment,map,kitchen, bedroom,bathroom,livingroom,
  return `"{'index':'${Math.floor(Math.random()*17)}'}"`;
};

//declare counters
let batchNum =0;
let batchCounter =1;

//Generate a batch of records
//
const getWritingOps = (num) => {
  let counter = 0;
  let batch = [];
  while (counter < num) {
    let docStr='';      
    do{      
      docStr+=generateListing(counter)+'~';
      counter++;     
    } while(counter%1000!==0);    
  batchNum++;
    batch.push({"batchId":batchNum,bundle:docStr});
  }
  console.log('batch in: #'+ batchCounter+ ' ready! | Time: '+ Math.round(Date.now() - timeInit)+ ' | Batch id: '+batchNum)
  batchCounter++;
  return batch.map(doc=>({'insertOne':doc}));
}

//Define batch of writing ops
//
const insertDocuments = (db, callback) => {
  // Get the documents collection
  const collection = db.collection(colName);  
  let counter = 0;
  while (counter < BATCH_QTY) {
    //append ops to bulk action async dispatcher
    collection.bulkWrite(getWritingOps(TARGET_RECORDS/BATCH_QTY,{ordered:false}), function (err, result) {
      if (err) console.log('error inserting batch: ', err)
      callback(result);
    });
    counter++;
  }
  }
//writing ops feedback counter
let outputBatch = 1;

//Initialize DB connection
//
MongoClient.connect(connectionStr,connectionParams, (err, client) => {
  if (err) console.log('error connecting to DB')

  //connect to database
  const db = client.db(dbName);

  //perform insert ops and display performance
  insertDocuments(db, function (result) {
    console.log('batch out #:', outputBatch, ' ,Time: ', Math.round((Date.now() - timeInit) / 1000), 's');
    outputBatch++;
  });

});

