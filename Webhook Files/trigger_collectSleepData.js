exports = async function(){
  
    //Access Event Collection
    const EventData = context.services.get("mongodb-atlas").db("SIoT").collection("EventData");
    const request = await EventData.findOne({"_id":new BSON.ObjectId("6186b6bb4072bbe0617a37be")});
  
    //Collected Upadated Access Key
    var OldrefreshToken = request.refresh_token;
    var accessKeyRequestURL = "https://api.fitbit.com/oauth2/token?grant_type=refresh_token&refresh_token="+OldrefreshToken;
    const accessKeyRequestResponse = await context.http.post({
       url: accessKeyRequestURL,
       headers: {"Content-Type": ["application/x-www-form-urlencoded"], "Authorization": ["Basic MjNCTVJLOmJhNjJhMDQxNzRiMzdlZjA5N2RjNjBhMDJhMGZhYmI2"]},
    });
    
    //Update database instance with retrieved access key
    var APIResponse = EJSON.parse(accessKeyRequestResponse.body.text());
    var newAccessToken = "Bearer " + APIResponse.access_token;
    var newRefreshToken = APIResponse.refresh_token;
    
    EventData.updateOne(
                  {"_id":new BSON.ObjectId("6186b6bb4072bbe0617a37be")}, //Filter
                  {$set: {"DataRequestAuthorization": newAccessToken, "refresh_token": newRefreshToken}})
    
    //Collect Last Nights Date
    var date = new Date()
    date.setDate(date.getDate() - 1);
    const yesterdaysDate = date.toISOString().substring(0, 10);
    
    //Collect Sleep Data from Fitbit API
    var sleepDataRequestURL = "https://api.fitbit.com/1.2/user/3YD4TX/sleep/date/"+yesterdaysDate+".json"
    const sleepDataRequestResponse = await context.http.get({
       url: sleepDataRequestURL,
       headers: {"Authorization": [newAccessToken]},
    });
    
    
    //Push Sleep Data to Collection
    const APIResponse2 = EJSON.parse(sleepDataRequestResponse.body.text());
      return EventData.updateOne(
                  {"dateID":yesterdaysDate}, //Filter
                  {$set: {"SleepEfficiency": APIResponse2.sleep[0].efficiency, "SleepDuration": APIResponse2.sleep[0].duration, "SleepStartTime": APIResponse2.sleep[0].startTime}},
                  {upsert:true} //Options
                
                   )
  };