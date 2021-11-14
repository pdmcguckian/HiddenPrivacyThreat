exports = function(payload,response) {
  
  const mongodb = context.services.get("mongodb-atlas");
  const sensordata = mongodb.db("SIoT").collection("BLEData");
  
  var body = {};
  if (payload.body) {
    
    try{
      
    const document = EJSON.parse(payload.body.text());
    
    sensordata.updateOne(
                {"timeStampID":document.timeStampID}, //Filter
                {$set: {"rssiBRDM": document.rssiBRDM}},
                {upsert:true} //Options
              
                 ).then(result => {
    response.setStatusCode(201);
  });
    }
    catch(err) {
      console.log(err);
      response.setStatusCode(500);
    }}
  
}