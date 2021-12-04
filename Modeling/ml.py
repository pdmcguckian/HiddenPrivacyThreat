import pymongo
import csv

client = pymongo.MongoClient("mongodb+srv://pdmcguckian:JeFrY#2618@siot.gashn.mongodb.net/SIoT?retryWrites=true&w=majority")
db = client["SIoT"]
col = db["BLEData"]

start = 1636632000
end = 1637928000
with open('/Users/pdmcguckian/Desktop/newdata.csv', 'r') as file:
    count = 0
    date = 11
    values = {}
    bdrm = 0
    lvngrm = 0
    ktchn = 0
    real = False

    reader = csv.reader(file)
    for row in reader:
        if count == 1440:
            if real:
                values[date] = [timein, ktchn, lvngrm, bdrm]
            count = 0
            bdrm = 0
            lvngrm = 0
            ktchn = 0
            date += 1
            timein = 0
            real = False
        
        count +=1

        try:
            lvngrmRSSI = int(row[1])
            bdrmRSSI = int(row[2])
            ktchnRSSI = int(row[3])

            if (bdrmRSSI == -100 and lvngrmRSSI == -100 and ktchnRSSI == -100):
                pass

            elif (bdrmRSSI >= ktchnRSSI and bdrmRSSI >= lvngrmRSSI):
                bdrm+=1

                if not real:
                    timein = count
                real = True

            elif (lvngrmRSSI >= bdrmRSSI and lvngrmRSSI >= ktchnRSSI):
                lvngrm += 1
                if not real:
                    timein = count
                real = True

            elif (ktchnRSSI >= bdrmRSSI and ktchnRSSI >= lvngrmRSSI):
                ktchn+=1
                if not real:
                    timein = count
                real = True

        except:
            pass
