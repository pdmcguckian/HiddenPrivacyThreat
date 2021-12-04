exports = function(payload) {
    
    const document = EJSON.parse(payload.body.text());
    
    var start_time = Number(document.date) - 43200;
    var end_time = Number(document.date) + 43200;
    
    console.log(start_time);

    const mongodb = context.services.get("mongodb-atlas");
	const mycollection = mongodb.db("SIoT").collection("BLEData");
    return mycollection.find({ timeStampID: { $gt: start_time, $lt: end_time} }).sort({timeStampID:1}).toArray();
	};