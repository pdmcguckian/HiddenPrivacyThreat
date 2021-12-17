exports = function(payload) {
    
    //Decode JSON Request
    const document = EJSON.parse(payload.body.text());

    //Decode datetime value iinto a string for just date
    var date = new Date(document.date*1000).toISOString().substring(0, 10);

    //Connected to database
    const mongodb = context.services.get("mongodb-atlas");
    const event = mongodb.db("SIoT").collection("EventData");

    //Return the instance for that given days Fitbit data
    return event.find({ dateID: date}).toArray();
	};