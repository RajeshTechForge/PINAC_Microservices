#!/bin/bash

GCP_PROJECT_ID="your-gcp-project-id"  # Replace with your GCP project ID
FIREBASE_PROJECT_ID="your-firebase-project-id"  # Replace with your Firebase project ID
REGION="europe-west1"

# Set the project
gcloud config set project $GCP_PROJECT_ID

# Deploy Auth Service
echo "Deploying Auth Service..."
gcloud run deploy auth-service \
  --source ./auth-service \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID

# Get Auth Service URL
AUTH_SERVICE_URL=$(gcloud run services describe auth-service --region=$REGION --format='value(status.url)')

# Update nginx.conf with actual auth service URL
sed -i "s|AUTH_SERVICE_URL|${AUTH_SERVICE_URL#https://}|g" api-gateway/nginx.conf

# Deploy API Gateway
echo "Deploying API Gateway..."
gcloud run deploy api-gateway \
  --source ./api-gateway \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "Deployment complete!"
echo "Auth Service URL: $AUTH_SERVICE_URL"
echo "API Gateway URL: $(gcloud run services describe api-gateway --region=$REGION --format='value(status.url)')"