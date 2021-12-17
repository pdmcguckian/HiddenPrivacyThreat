exports = function(payload) {
   
    //Decode JSON Request
    const document = EJSON.parse(payload.body.text());
    
    //Calculate the UNIX Timestamp for noon the day before and after
    var start_time = Number(document.date) - 43200;
    var end_time = Number(document.date) + 43200;
    
    //Connected to database
    const mongodb = context.services.get("mongodb-atlas");
	const mycollection = mongodb.db("SIoT").collection("BLEData");

    //Return all instasnces between the start and end time
    return mycollection.find({ timeStampID: { $gt: start_time, $lt: end_time} }).sort({timeStampID:1}).toArray();
	};