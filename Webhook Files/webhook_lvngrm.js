exports = function(payload,response) {
  
  //Connect to BLE data collection
  const mongodb = context.services.get("mongodb-atlas");
  const sensordata = mongodb.db("SIoT").collection("BLEData");
  
  //If incoming reuqest has a body
  var body = {};
  if (payload.body) {
    
    try{
      
    //Decode JSON information
    const document = EJSON.parse(payload.body.text());
    
    //Update database to include livingroom RSSI values
    sensordata.updateOne(
                {"timeStampID":document.timeStampID}, //Filter
                {$set: {"rssiLVNGRM": document.rssiLVNGRM}},
                {upsert:true}  //If value doesn't exist for this timestamp, create a new one
              
                //Once complete - return ESP a response code
                 ).then(result => {
    response.setStatusCode(201);
  });
    }
    //If an erros has a occured return error codse
    catch(err) {
      console.log(err); // Save error to logs for later debugging
      response.setStatusCode(500);
    }}
  
}