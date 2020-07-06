curl -X "POST" "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classifiers?api_key=159b1915dc0d7456e32ab7a13f6764e5746989a8&version=2016-05-20" \
-H "Content-Type: multipart/form-data; charset=utf-8;" \
-F "name=Starbucks" \
-F "stores_positive_examples=stores.zip" \
-F "cups_positive_examples=cups.zip"
