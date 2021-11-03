#!/bin/bash

echo "Running 'npm install' on lambda function..."
npm install || exit 1

echo "Zipping package for deployment to AWS Lambda..."
zip -r lambda-deployment-package.zip . || exit 1

echo "Updating Lambda function with updated code..."
aws lambda update-function-code --function-name generate-vanity-numbers --zip-file fileb://lambda-deployment-package.zip --region us-east-1 --profile personal || exit 1

#echo "Invoking function to test..."
#aws lambda invoke --function-name generate-vanity-numbers out --payload '16124333552' --log-type Tail --region us-east-1 --profile personal
