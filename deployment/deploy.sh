#!/bin/bash

# connect instance with custom template

echo "Generating .zip file for generate-vanity-numbers lambda..."
cd lambdas/generate-vanity-numbers
npm install || exit 1
zip -r generate-vanity-numbers.zip . || exit 1
aws s3 cp generate-vanity-numbers.zip s3://franzel-cf-lambdas/ --region us-east-1 --profile personal || exit 1
rm generate-vanity-numbers.zip
cd ../.. || exit 1

#aws cloudformation delete-stack --stack-name cloud-foundry-coding-assessment --region us-east-1 --profile personal

#echo "Executing the cloudformation template..."
aws cloudformation create-stack --stack-name cloud-foundry-coding-assessment \
  --template-body file://deployment/vanity_number_stack.json \
  --region us-east-1 \
  --profile personal \
  --capabilities CAPABILITY_NAMED_IAM
