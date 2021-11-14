exports = function(payload) {
	   const mongodb = context.services.get("mongodb-atlas");
	   const mycollection = mongodb.db("SIoT").collection("BLEData");
	   return mycollection.find({}).limit(1440).toArray();
	};