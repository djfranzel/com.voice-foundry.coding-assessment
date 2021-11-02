#!/bin/bash

echo "Running 'npm install' on lambda function..."
cd lambdas/cloud-foundry_coding-assessment_vanity-numbers || exit 1
npm install || exit 1

echo "Zipping package for deployment to AWS Lambda..."
zip -r lambda-deployment-package.zip . || exit 1

echo "Updating Lambda function with updated code..."
aws lambda update-function-code --function-name cloud-foundry_coding-assessment_vanity-numbers --zip-file fileb://lambda-deployment-package.zip --region us-east-2 --profile personal || exit 1
