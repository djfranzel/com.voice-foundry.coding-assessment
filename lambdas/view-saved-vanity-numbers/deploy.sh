#!/bin/bash

echo "Running 'npm install' on lambda function..."
npm install || exit 1

echo "Zipping package for deployment to AWS Lambda..."
zip -r lambda-deployment-package.zip . || exit 1

echo "Updating Lambda function with updated code..."
aws lambda update-function-code --function-name view-saved-vanity-numbers --zip-file fileb://lambda-deployment-package.zip --region us-east-1 --profile personal || exit 1
