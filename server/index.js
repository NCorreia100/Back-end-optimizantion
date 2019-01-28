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

require('newrelic');

//import server-side-rendering dependencies
const React = require('react');
const {renderToNodeStream } = require('react-dom/server');


//import components & database driver
const Carousel = require('../client/app.jsx').default;
const db = require('../database/index.js');

//instantiate server & apply middleware
const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(compression());

////////////////////
//  Serve Routes

  // Static Files
  app.use('/carousel/static/', express.static(path.resolve(__dirname, '../public')));

  //serve html on SSR
app.get('/:id(\\d+)/', (req, res) => {
  console.log('ID:::', req.params)
  let listingId = req.params.id;
  if (listingId < 1 || listingId > 10000000) {
    res.sendStatus(405)
  }
  
  res.write(getInitialHtml());

  getComponentWithProps(listingId, (err, stream) => {
    if (err) console.log('error getting Carousel component: ', err);
    else {
      stream.pipe(res, { end: 'false' })
      stream.on('end', () => res.end(getFinalHtml()))       
      }
  });
});

// serve the photos ----not used in SSR
app.get('/carousel/photos/:id', (req, res) => {
  const listingId = req.params.id;
  if (listingId < 1 || listingId > 10000000) {
    res.sendStatus(405)
  }
  db.getCarouselImages(listingId, (err, URLs) => {
    // If nothing is found, respond with 404
    if (err) res.sendStatus(404);
    else res.json(Object.values(URLs));
  })
});


  //send the Carousel component to the proxy
  app.get('/:id(\\d+)/', (req, res) => {
    console.log('ID:::', req.params)
    let listingId = req.params.id;
    if (listingId < 1 || listingId > 10000000) {
      res.sendStatus(405)
    }    
     
    getComponentWithProps(listingId, (err, stream) => {
      if (err) console.log('error getting Carousel component: ', err);
      console.log('stream:', stream);
      stream.pipe(res)
      stream.on('end',res.end('done'))
       
    });

  }); 

////////////////////
//  Export server for testing
// export default app;

//get the html content of the body
var getComponentWithProps = function (listingId, callback) {

  db.getCarouselImages(listingId, (err, URLs) => {
    if (err) callback(err);
    else {
      callback(null,renderToNodeStream(<Carousel carouselPhotos={Object.values(URLs)} />));
    }
  })
};

   
 //html before the carousel component is attached
var getInitialHtml = function(){       
    return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Image Carousel Component</title>    
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link defer rel="stylesheet" type="text/css" media="screen" href="/carousel/static/reset.css" />
    <link defer rel="stylesheet" type="text/css" media="screen" href="/carousel/static/carousel-style.css" />    
    </head>
    <body>
    <div id="carousel-container">`
  }
      
  //html after the components
  var getFinalHtml = function(){
    return ` 
    </div>   
    </body>
    <script defer src='/carousel/static/bundle.js><script>
  </html>`
}

  ////////////////////
  //  Run Server
  
  app.listen(PORT, (err, data) => {
    if (err) return console.log('Error starting server:', err);
    console.log(`Successfully started server on http://localhost:${PORT}`);
  });