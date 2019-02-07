/////++this file uses the img-url and stores a bin of the image++//////

////++discontinued++////

const fetch = require('node-fetch');
const Buffer = require('buffer/').Buffer
const fs = require('fs');
//files from FS
const mapUrls = require('./sample-data/map_images.json');
const floorPlanUrls = require('./sample-data/floor_plan_images.json');
const apartmentUrls = require('./sample-data/apartment_images.json');


//key
const MAPBOX_TOKEN = require('../config.js').MAPBOX_TOKEN

const timeInit = Date.now()

//make sure the following vars match


counter = 0;

const getImgFromURL = (fileToSave,key, token = "") => {
    let cws = fs.createWriteStream('database/bin/' + fileToSave)
    cws.write('{"imgs":[');

    Promise.all(
       key.map(imgURL => {
            return fetch(imgURL + token, {
                method: 'GET',
                mode: 'no-cors',
                headers: { 'Content-Type': 'image/jpg' }
            })
                .then(file => file.arrayBuffer())
                .then(buffer => new Buffer(buffer, 'base64'))
                .then(stream => {
                    cws.write(stream);
                    counter++;
                    console.log('stream: ', stream);
                })
                .then(() => cws.write(','))
                .catch(err => console.log('unable to store to file, reason: ', err))
        })
    ).then(() => {
        cws.write(']}');
        cws.on('end', () => {
            cws.end()
            console.log('total files: ', counter)
            console.log('time taken: ', Date.now() - timeInit)
        })
    })

}

// getImgFromURL('maps.json',mapUrls.urls, MAPBOX_TOKEN);
// getImgFromURL('floorPlan.json',floorPlanUrls.urls);

let roomtype = "exterior"  //change this manually
    getImgFromURL(roomtype+'.json',apartmentUrls[roomtype])






