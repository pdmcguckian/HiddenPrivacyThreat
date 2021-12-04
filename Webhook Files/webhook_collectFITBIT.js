exports = function(payload) {
    
    const document = EJSON.parse(payload.body.text());
    var date = new Date(document.date*1000).toISOString().substring(0, 10);

    const mongodb = context.services.get("mongodb-atlas");
    const event = mongodb.db("SIoT").collection("EventData");

    return event.find({ dateID: date}).toArray();
	};