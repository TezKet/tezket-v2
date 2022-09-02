

```
npx tsc backends/wss/index.ts
node backends/wss/index.js

```

```
export GOOGLE_CLOUD_PROJECT=`gcloud config get-value project`
echo $GOOGLE_CLOUD_PROJECT

gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/tezket-wss
gcloud container images list

gcloud auth login
gcloud auth configure-docker

docker run -ti --rm -p 8080:8083 gcr.io/$GOOGLE_CLOUD_PROJECT/tezket-wss

```


```

gcloud init

gcloud run deploy
gcloud run deploy tezket-wss \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/tezket-wss

```