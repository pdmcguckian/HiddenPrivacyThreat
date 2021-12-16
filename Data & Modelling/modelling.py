from numpy.lib.twodim_base import diagflat
import pymongo
import csv
import pandas as pd
import numpy as np
from sklearn import svm, tree
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
import pickle



dimension_reduced_ble = {}
with open('/Users/pdmcguckian/Documents/IoT/BLEData.csv', 'r') as file:
    count = 0
    date = 12
    bdrm = 0
    lvngrm = 0
    ktchn = 0
    real = False

    reader = csv.reader(file)
    for row in reader:
        if count == 1440:
            
            if date == 27:
                date = 28

            dimension_reduced_ble[date] = [timein, lvngrm, bdrm, ktchn]
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
        except:
            lvngrmRSSI = -100
        
        try:
            bdrmRSSI = int(row[2])
        except:
            bdrmRSSI = -100
        
        try:
            ktchnRSSI = int(row[3])
        except:
            ktchnRSSI = -100

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
        pass

print(dimension_reduced_ble)

dataset = []
with open('/Users/pdmcguckian/Documents/IoT/PredictionData.csv', 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        date = int(row[0])
        alcohol = int(row[1])
        sleep = int(row[2])

        if sleep != 0:
            if sleep > 84:
                sleep_quality = 1

            else:
                sleep_quality = 0

            instance = [alcohol, sleep_quality, dimension_reduced_ble[date][0], dimension_reduced_ble[date][1], dimension_reduced_ble[date][2], dimension_reduced_ble[date][3]]
            dataset.append(instance)


df = pd.DataFrame(dataset, columns=['Alcohol', 'Sleep', 'TimeIn', 'LivingRoom', 'Bedroom', 'Kitchen'])
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
#pd.DataFrame.to_csv(df, 'data.csv')
print(df)

X = df.drop(columns=["Alcohol", "Sleep"])
#y = df['Alcohol']
y = df['Sleep']

clf = svm.SVC(kernel='linear', C=10)
#clf = tree.DecisionTreeClassifier(max_depth = 2, min_impurity_decrease=0.0)
#poly = PolynomialFeatures(degree = 2, interaction_only=False, include_bias=False)
#X = poly.fit_transform(X)
#clf = LogisticRegression(max_iter=1300, C=100)
scores = cross_val_score(clf, X, y, cv=3)

print(scores)
print("%0.2f accuracy with a standard deviation of %0.2f" % (scores.mean(), scores.std())) 

