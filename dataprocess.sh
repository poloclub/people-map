#!/bin/sh

set -e

pip install -r requirements.txt
#nltk.download('stopwords')
python ./Preprocessing/QueryGoogle.py
python ./Preprocessing/GeneratePeopleMapFiles.py

#Moves the files to the folder before running npm
mv "citedClusters.js" "src/components"
mv "citedResearchQuery.js" "src/components"
mv "citedCoordinates.js" "src/components"
mv "recentClusters.js" "src/components"
mv "recentResearchQuery.js" "src/components"
mv "recentCoordinates.js" "src/components"

npm install
npm audit fix
npm run dev