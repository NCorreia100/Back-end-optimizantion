# Image Carousel API

The image carousel API is accessible at the url: `/api/carousel/:id` where `:id` is a parameter of value 1 to 10'000'000.

GET requests to this URL receive a JSON object that provides urls for all the images in the format:
{
one real estate listing's image carousel. A GET request to the API should return a JSON object with up to 8 keys, and a single string url per key. The keys are `exterior`, `kitchen`, `bedroom`,`bathroom`,`livingroom`,`amenities`, `map` and `floorPlan`. If a listing doesn't contain a URL for that key (as commonly the map location may not be provided), the value of null is assigned.

If the param can't be converted to a number whitin the range aforementioned, the server will send a response with status 407.

A sample response for a request with a param `id` of `7654320`:

```bash
$ curl http://localhost:3010/api/carousel/7654320
{
    "exterior": "https://www.elliman.com/img/c1c16b777a8bab4afe3b4edf0e0adc89329e38ff+440++1",
    "kitchen": "https://www.elliman.com/img/d9f471eee75f0efff643132176e6ad91c1543759+440++1",
    "bedroom": "https://www.elliman.com/img/c1b66740f507b23750f602b4147446536cce6c07+440++1",
    "bathroom": "https://www.elliman.com/img/186da8aace77874d3cbd7321549c5d91dedc22a8+440++1",
    "livingroom": "https://www.elliman.com/img/801c6b242be096bd606bb80fcf82bebb276661a1+440++1",
    "amenities": "https://www.elliman.com/img/9eb12bde40328e86939403d87dabc5fa12268c72+440++1",
    "map": "https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/url-https%3A%2F%2Fcdn-assets-s3.streeteasy.com%2Fassets%2Fmap%2Fstatic-map-marker%402x-9a7b6523f406fc1bca992bf7132b76f581228967ba388d2fea8aa517a7af579e.png%28-73.96009827%2C40.65499878%29%2Cpath-3%2B0066CC-0.6%2B000000-0.05%28%7DkcwFjglbMoCqmAgo%40fDsCTjC%7ClAh%40hJnB%60BrA%60%40rq%40aG%29/-73.96009827,40.65499878,11/574x400@2x?access_token=**[hidden Mapbox API key]**",
    "floorPlan": "https://www.elliman.com/img/92364f3b310162f41de8ba1a97f816065efccce7+440++1"
}
```

Whenever a GET request  to this API is honored, the function `getCarouselImage(listingId, callback)` is invocked in which `listingId` is the value of the `id` provided on the GET request and `callback` is an anonimous function that follows Node.js standards, logging an error on the server if the database transaction is unsuccessful, or will provide its output as API request otherwise.

The database deployed is a MongoDB NO-SQL instance that contains the URLs grouped into bulks of 1000 listings concatenated into strings.

The function `getCarouselImage(listingId, callback)` is declared as follows:

```
module.exports.getCarouselImages = (listing, callback) => {
    
    let listingId = listing-1;  //adjusted for array indexing

    //mongo/s instance: connectionStr is the database URI, connectionPArams are the instantiation options 
    MongoClient.connect(connectionStr,connectionParams, (err, client) => {
            if (err) console.log('error connecting to DB')

            //URI, options, db name and collection name imported from database/config.js file, Mapbox token imported from project config.js
            const db = client.db(dbName);
            const collection = db.collection(colName);

            //all listing photos are bundled into 1000 batches, first batch has an id of 1
            let batchId = Math.floor(listingId/1000)+1;
            let batchListing = listingId%1000;
            console.log('Batch: #'+batchId+'; Batch index '+batchListing);

            //quering the database using the batch id as filter argument
            collection.findOne({'batchId':batchId}, (err, data) => {
                if (err) callback(err)

                else {  
                    //on success deconcatenate bundled listing records and resolve target listing
                    let targetDoc = data.bundle.split('~')[batchListing];
                    
                    let randomNum = parseInt(targetDoc.substring(11,13));                   
                    if(isNaN(randomNum)){
                        randomNum = parseInt(targetDoc.substring(11,12)); 
                    }     

                    //read from File containing all URLs and assign key-value pairs to URLs object
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
```


