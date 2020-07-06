## Create Classifier
curl -X "POST" "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classifiers?api_key=159d1965dc0d7456e33ab7a13a6764e5746989a8&version=2016-05-20" \
     -H 'Content-Type: multipart/form-data; charset=utf-8;' \
     -F "closed_day_positive_examples=@closed.day.zip" \
     -F "open_day_positive_examples=@open.day.zip" \
     -F "closed_night_positive_examples=@closed.night.zip" \
     -F "open_night_positive_examples=@open.night.zip" \
     -F "name=garage"
