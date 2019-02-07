

///////+++Express Server+++////////

//[DEV ONLY] import new relic module for reporting
//require('newrelic');

//environment configs
const PORT = process.env.PORT || 3010;



//Import dependencies
//
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');

//server-side-rendering dependencies
const React = require('react');
const {renderToNodeStream } = require('react-dom/server');

//components & database driver
const Carousel = require('../client/app.jsx').default;
const db = require('../database/index.js');

//instantiate server & apply middleware
//
const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(compression());


//  Serve Routes
//

//set default directory to server static files
app.use('/carousel/static/', express.static(path.resolve(__dirname, '../public')));

//[NOT FOR PROXY] serve html on SSR
app.get('/:id(\\d+)/', (req, res) => {
  console.log('ID:::', req.params)

  //validate request
  let listingId = req.params.id;
  if (listingId < 1 || listingId > 10000000) {
    res.sendStatus(407)
  }
  
  //send async response in multiple blocks using a stream
  res.write(getInitialHtml());

  //get react components
  getComponentWithProps(listingId, (err, stream) => {
    if (err) console.log('error getting Carousel component: ', err);
    else {
      stream.pipe(res, { end: 'false' })
      stream.on('end', () => res.end(getFinalHtml()))       
      }
  });
});

//[NOT USED IN SSR] serve the photos 
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


  //{PROXY REQUESTS] send the Carousel component to the proxy
  app.get('/:id(\\d+)/', (req, res) => {
    console.log('ID:::', req.params)
    let listingId = req.params.id;

    //validation now done on the proxy
    // if (listingId < 1 || listingId > 10000000) {
    //   res.sendStatus(407)
    // }    
    
    //get react components
    getComponentWithProps(listingId, (err, stream) => {
      if (err) console.log('error getting Carousel component: ', err);     
      stream.pipe(res)
      stream.on('end',res.end('done'))       
    });

  }); 


//  Export server for testing
// export default app;

//get the body html markup
var getComponentWithProps = function (listingId, callback) {

  //get prop data from database
  db.getCarouselImages(listingId, (err, URLs) => {
    if (err) callback(err);
    else {
      //interpolate component with data into HTML body and return it
      callback(null,renderToNodeStream(<Carousel carouselPhotos={Object.values(URLs)} />));
    }
  })
};

   
 //HTML before the component are attached on SSR
 //
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
      
  //HTML after the components are attached on SSR
  //
  var getFinalHtml = function(){
    return ` 
    </div>   
    </body>
    <script defer src='/carousel/static/bundle.js><script>
  </html>`
}

  
  //Initiate request event handler  
  app.listen(PORT, (err, data) => {
    if (err) return console.log('Error starting server:', err);
    console.log(`Successfully started server on http://localhost:${PORT}`);
  });