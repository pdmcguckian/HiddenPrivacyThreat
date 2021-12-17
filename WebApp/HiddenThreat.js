
//FUNTION TO CHANGE MASTER DATE
function change_date(direction) {

    //Destorys no old charts to avoid bufs
    chart1.destroy();
    chart2.destroy();
    chart3.destroy();
    chart4.destroy();

    //Move the date value 1 in direction
    dateControl = dateControl + direction;
    NextDate = dateControl + 1;

    //If reached the start - dont change
    if (dateControl < 12 && dateControl > 10) {
        dateControl = 12;
        NextDate = 13;
    }

    //If reached the end - dont change
    else if (dateControl < 8 && dateControl > 4) {
        dateControl = 4;
        NextDate = 5;
    }

    //If going from November to December Reset
    else if (dateControl == 31) {
        dateControl = 1;
        NextDate = 2;
    }

    //If going from December to November Rest
    else if (dateControl == 0) {
        dateControl = 30;
        NextDate = 1;
    }

    //If a november date, set universal dare date
    if (dateControl > 4) {
        date = new Date("November " + dateControl + ", 2021")
    }

    //If a dcember date, set universal date
    else {
        date = new Date("December " + dateControl + ", 2021")
    }
    
    //Update all websiite grapghs wiith new date
    change_date_text();
    render_graphs();
    collect_events();}

// FUNCTION TO UPDATE DATE VALUES DISPLAYED BETWEEN BUTTONS
function change_date_text(direction) {
    document.getElementById('date1').innerHTML = date.toISOString().substring(0, 10) + " - " + (NextDate);
    document.getElementById('date2').innerHTML = date.toISOString().substring(0, 10) + " - " + (NextDate);
    document.getElementById('date3').innerHTML = date.toISOString().substring(0, 10) + " - " + (NextDate);
}

// FUNTION TO RENDER ALL BLE GRAPGHS
async function render_graphs() {
    //Convert date variable to required for webjook
    var pushDate = date.toISOString().substring(0, 10);
    const javaScriptRelease = Date.parse(pushDate)/1000;
    
    //Create JSON package to send in rquestis
    var data = {
        date: javaScriptRelease
    };
    var json = JSON.stringify(data);

    // Pish Post request
    var requestURL = "https://webhooks.mongodb-realm.com/api/client/v2.0/app/predictor-rjhbq/service/sendWebApp/incoming_webhook/webhook_collectBLE?secret=SIoT";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", requestURL);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(json);

    //Empty arrays to be filled with returnd data
    //Timestamp values
    var xValues = [];
    //Room Prediction Values
    var ktchnBool = [];
    var bdrmBool = [];
    var lvngrmBool = [];
    var wyBool = [];
    //Raw BLE Values
    var ktchnValues = [];
    var bdrmValues = [];
    var lvngrmValues = [];
    //Empty arrrats to stor smoothed values
    var smooth_bdrm = [];
    var smooth_lvngrm = [];
    var smooth_ktchn = [];

    //When request recieved
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {

        //Decode JSON
        var collectedBLEData = JSON.parse(xhr.responseText);

        //For every returned value
        for(var i = 0; i < collectedBLEData.length; i++) {

            //Collect instance
            var obj = collectedBLEData[i];
            
            try {

                //Collect Values
                bdrmRSSI = Number(obj.rssiBDRM.$numberInt);
                lvngrmRSSI = Number(obj.rssiLVNGRM.$numberInt);
                ktchnRSSI = Number(obj.rssiKTCHN.$numberInt);

                //Save instances raw data values to arrays for plotting
                var time = new Date(obj.timeStampID.$numberInt*1000).toISOString().substring(11, 16);
                ktchnValues.push(ktchnRSSI);
                lvngrmValues.push(lvngrmRSSI);
                bdrmValues.push(bdrmRSSI);
                xValues.push(time);

            }
            catch(err) {
            }

        }

        //Smoothing system - required to improve room prediiction
        //For every value in the raw data array
        for (var i = 1; i < ktchnValues.length-1; i++)
        {
            //Calculaye beedroom moving average
            var mean = (bdrmValues[i] + bdrmValues[i-1] + bdrmValues[i+1] + bdrmValues[i-2] + bdrmValues[i+2] + bdrmValues[i-3] + bdrmValues[i+3])/7.0;
            smooth_bdrm.push(mean);

            //Calculate and sace living room moving average
            var mean = (lvngrmValues[i] + lvngrmValues[i-1] + lvngrmValues[i+1] + lvngrmValues[i-2] + lvngrmValues[i+2] + lvngrmValues[i-3] + lvngrmValues[i+3])/7.0;
            smooth_lvngrm.push(mean);

            //Calculat and save kitchen moviing average
            var mean = (ktchnValues[i] + ktchnValues[i-1] + ktchnValues[i+1] + ktchnValues[i-2] + ktchnValues[i+2] + ktchnValues[i-3] + ktchnValues[i+3])/7.0;
            smooth_ktchn.push(mean);
        }

        //Calculate which room I was in each minute based on smoothed data
        for (var i = 0; i < ktchnValues.length; i++) {
            bdrmRSSI = smooth_bdrm[i]
            lvngrmRSSI = smooth_lvngrm[i]
            ktchnRSSI = smooth_ktchn[i]

            //If out of the house
            if (bdrmRSSI == -100 && lvngrmRSSI == -100 && ktchnRSSI == -100) {
                ktchnBool.push(0);
                lvngrmBool.push(0);
                bdrmBool.push(0);
                wyBool.push(1);
            }

            //If in kitchen
            else if (ktchnRSSI >= bdrmRSSI && ktchnRSSI >= lvngrmRSSI) {
                ktchnBool.push(1);
                lvngrmBool.push(0);
                bdrmBool.push(0);
                wyBool.push(0);
            }
            
            // If in living room
            else if (lvngrmRSSI >= bdrmRSSI && lvngrmRSSI >= ktchnRSSI) {
                ktchnBool.push(0);
                lvngrmBool.push(1);
                bdrmBool.push(0);
                wyBool.push(0);
            }

            // If in bedroom
            else if (bdrmRSSI >= ktchnRSSI && bdrmRSSI >= lvngrmRSSI) {
                ktchnBool.push(0);
                lvngrmBool.push(0);
                bdrmBool.push(1);
                wyBool.push(0);
            }
        }

        //Determine if I was not in the house at any point - if so update metrics accoriuidongly
        minutes_not_in = wyBool.reduce((partial_sum, a) => partial_sum + a, 0)
        if (minutes_not_in >= 1339) {
            document.getElementById('sleepQualityPrediction').innerHTML = "N/a";
            document.getElementById('alcoholPrediction').innerHTML = "N/a";
            document.getElementById('alcoholconsumed').innerHTML = "N/a";
            document.getElementById('sleepquality').innerHTML  = "N/a";
            document.getElementById('timeIn').innerHTML = "Time In: N/a";
            document.getElementById('LivingRoomTime').innerHTML = "Living Room: N/a";
            document.getElementById('KitchenTime').innerHTML = "Kitchen: N/a";
            document.getElementById('BedroomTime').innerHTML  = "Bedroom: N/a";
        }

        //If i was in the house, make predictions
        else {
            make_predictions(ktchnBool, lvngrmBool, bdrmBool);
        }

        //Plot room location prediciton chart
        var chart1 = new Chart("roomlocation", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
            borderColor: "rgb(33,42,53)",
            data: bdrmBool,
            borderWidth: 5
            
            },{
            borderColor: "rgb(160,160,160)",
            fill: 1,
            data: ktchnBool,
            borderWidth: 5
            
            },{

            borderColor: "rgb(132,60,11)",
            fill: 1,
            data: lvngrmBool,
            borderWidth: 5

            
            }]

        },
        options: {
            legend: {display: false},
            animation: {duration: 0},
            tooltips: {enabled: false},
            hover: {mode: null},
            maintainAspectRatio: false,
        }
        });

        //Plot bedroom Raw BLE chart
        var chart2 = new Chart("bedroom", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
            data: bdrmValues,
            borderColor: "rgb(33,42,53)",
            fill: false
            }]
        },
        options: {
            legend: {display: false},
            animation: {duration: 0},
            tooltips: {enabled: false},
            hover: {mode: null},
            maintainAspectRatio: false
        }
        });

        //Plot livingroom BLE chart
        var chart3 = new Chart("livingroom", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
            data: lvngrmValues,
            borderColor: "rgb(132,60,11)",
            fill: false
            }]
        },
        options: {
            legend: {display: false},
            animation: {duration: 0},
            tooltips: {enabled: false},
            hover: {mode: null},
            maintainAspectRatio: false,
        }
        });
        
        //Plot kitchen BLE chart
        var chart4 = new Chart("kitchen", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
            data: ktchnValues,
            borderColor: "rgb(160,160,160)",
            fill: false
            }]
        },
        options: {
            legend: {display: false},
            animation: {duration: 0},
            tooltips: {enabled: false},
            hover: {mode: null},
            maintainAspectRatio: false
        }
        });

    }};
}


// FUNCTION TO COLLECT AND DISPLAY FITBIT DATA
async function collect_events() {

    //Build JSON File to send request
    var pushDate = date.toISOString().substring(0, 10);
    const javaScriptRelease = Date.parse(pushDate)/1000;
    var data = {
        date: javaScriptRelease
    };
    var json = JSON.stringify(data);

    //Push request
    var requestURL = "https://webhooks.mongodb-realm.com/api/client/v2.0/app/predictor-rjhbq/service/sendWebApp/incoming_webhook/webhook_collectFITBIT?secret=SIoT";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", requestURL);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send(json);

    //When response recicbed
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {

        //Unpack repsonse
        var collectedEventData = JSON.parse(xhr.responseText);

        //Collect Values
        sleepQuality = collectedEventData[0].SleepEfficiency.$numberInt;
        if (sleepQuality == undefined) {
            sleepQuality = collectedEventData[0].SleepEfficiency.$numberLong;
        }
        AlcoholConsumed = collectedEventData[0].AlcoholConsumed;

        //Update alcohol graphics
        if (AlcoholConsumed) {
        document.getElementById('alcoholconsumed').innerHTML = "Yes";
        }
        else {
        document.getElementById('alcoholconsumed').innerHTML = "No";
        }

        //Update sleep qulity grtapghs
        if (sleepQuality > 84) {
        document.getElementById('sleepquality').innerHTML  = "Good";
        }
        else {
        document.getElementById('sleepquality').innerHTML = "Poor";
        }
}}}

// FUNCTIION TO PERFORM LIVE PREDICTOINSS IN BROWSER
async function make_predictions(ktchnBool, lvngrmBool, bdrmBool) {
    
    //Calculate time in each room
    ktchnTime = ktchnBool.reduce((partial_sum, a) => partial_sum + a, 0)
    lvngrmTime = lvngrmBool.reduce((partial_sum, a) => partial_sum + a, 0)
    bdrmTime = bdrmBool.reduce((partial_sum, a) => partial_sum + a, 0)
    
    //Calculate time in the door
    timeIn = 0;
    for (let i = 0; i < 1440; i++) { 
        if (ktchnBool[i] == 1 || lvngrmBool[i] == 1 || bdrmBool[i] == 1) {
            timeIn = i;
            break
        }
        }
    
    //Make pedictions based on machine learing models
    y_sleep = -0.012*timeIn -0.00382*lvngrmTime+ 0.015*bdrmTime +  0.00206 * ktchnTime-1.81;
    y_alcohol = 0.0189*timeIn + 0.0599*lvngrmTime + 0.0173*bdrmTime +0.0916*ktchnTime-27.51;

    //Update sleep graphic based on predictions
    if (y_sleep < 0) {
        document.getElementById('sleepQualityPrediction').innerHTML = "Poor";
    }
    else {
        document.getElementById('sleepQualityPrediction').innerHTML = "Good";
    }

    //Update alcohol graphic based on predictions
    if (y_alcohol < 0) {
        document.getElementById('alcoholPrediction').innerHTML = "No";
    }
    else {
        document.getElementById('alcoholPrediction').innerHTML = "Yes";
    }

    //Dispay dimensioality reduced variables
    document.getElementById('timeIn').innerHTML = "Time In: " + timeIn;
    document.getElementById('LivingRoomTime').innerHTML = "Living Room: " + lvngrmTime;
    document.getElementById('KitchenTime').innerHTML = "Kitchen: " + ktchnTime;
    document.getElementById('BedroomTime').innerHTML  = "Bedroom: " + bdrmTime;

    }



//FUNTION TO SWITCH BETWEEN WEBSITE SECTIONS
function projectCards(section) {

    //If hover over about section display
    if (section===0) {
        about.style.display = "flex";
        predictions.style.display = "none";
        truedata.style.display = "none";

        document.getElementById("aboutcard").className = "cardhover";
        document.getElementById("predictionscard").className = "card";
        document.getElementById("truedatacard").className = "card";
    }

    //If hover over about predictions sextion display
    if (section===1) {
        about.style.display = "none";
        predictions.style.display = "flex";
        truedata.style.display = "none";

        document.getElementById("aboutcard").className = "card";
        document.getElementById("predictionscard").className = "cardhover";
        document.getElementById("truedatacard").className = "card";

        //Update values
        change_date_text();
        render_graphs();
        collect_events();

    }
    
    //If hover over about true data sextion display
    if (section===2) {
        about.style.display = "none";
        predictions.style.display = "none";
        truedata.style.display = "flex";

        document.getElementById("aboutcard").className = "card";
        document.getElementById("predictionscard").className = "card";
        document.getElementById("truedatacard").className = "cardhover";

        //Update values
        change_date_text();
        render_graphs();
        collect_events();
    }
}