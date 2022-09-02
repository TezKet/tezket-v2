

```

node index.js


```

```
export GOOGLE_CLOUD_PROJECT=`gcloud config get-value project`
echo $GOOGLE_CLOUD_PROJECT

gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/tezket-api
gcloud container images list

gcloud auth login
gcloud auth configure-docker

docker run -ti --rm -p 8080:8080 gcr.io/$GOOGLE_CLOUD_PROJECT/tezket-api

```


```

gcloud init

gcloud run deploy
gcloud run deploy tezket-api \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/tezket-api

```