////////////////////////////////////////////////////////////
//
//    Express Server

////////////////////////////////////////
//  Configuration Constants

const PORT = process.env.PORT || 3010;


/////////////////////////////////////////
//  Import dependencies

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const React = require('react');
const { renderToString } = require('react-dom/server');

//import component
const Carousel = require('../client/app.jsx').default;

// Import Database Connection
const db = require('../database/index.js');

//import new relic performance analyzer
require('newrelic');

//instantiate server
const app = express();

// Apply middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(compression());

////////////////////
//  Serve Routes

// Static Files
app.use('/carousel/static/', express.static(path.resolve(__dirname, '../public')));

app.get('/:id(\\d+)/', (req, res) => {
  console.log('ID:::', req.params)
  let listingId = req.params.id;
  if (listingId < 1 || listingId > 10000000) {
    res.sendStatus(407).json("Param not accepted")
  }
  renderedPage(listingId, (err, markup) => {
    if (err) console.log('ERROR retrieving HTML ', err);
    else res.send(markup);
  });
});



// API Routes
app.get('/carousel/photos/:id', (req, res) => {
  const listingId = req.params.id;
  if (listingId < 1 || listingId > 10000000) {
    res.sendStatus(407).json("Param not accepted")
  }
  db.getCarouselImages(listingId, (err, output) => {
    // If nothing is found, respond with 404
    if (err) res.sendStatus(404);
    else res.send(output);
  })
});

////////////////////
//  Run Server

app.listen(PORT, (err, data) => {
  if (err) return console.log('Error starting server:', err);
  console.log(`Successfully started server on http://localhost:${PORT}`);
});


////////////////////
//  Export server for testing
export default app;

//html for server side rendering
var renderedPage = function (listingId, callback) {

  db.getCarouselImages(listingId, (err, URLs) => {
    if (err) callback(err);
    else {
      let component = renderToString(<Carousel carouselPhotos={Object.values(URLs)} />);
      callback(null, `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Image Carousel Component</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" media="screen" href="/carousel/static/reset.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/carousel/static/carousel-style.css" />
  </head>
  <body>
    <div id="carousel-container">
    ${component}
      <div id="carousel-body">
        <div class="main-image-area">
          <ul class="main-image-list">
            <li class="main-image-list-item">
              <img class="main-image" />
            </li>
          </ul>
        </div>
        <div class="carousel-thumb-container">
          <ul class="thumb-list"> </ul>
          <div class="button-container">
            <div class="floor-plan-button">
              <span class="button-text" >Floor Plan</span>
            </div>
            <div class="map-button">
            </div>
          </div>
        </div>
      </div>
    </div>
   
  </body>
  </html>`)
    }
  })
}
