#!/bin/bash

AWS_REGION=us-east-1
AWS_PROFILE=personal

AWS_S3_DEPLOYMENT_BUCKET=franzel-cf-lambdas
AWS_CONNECT_INSTANCE_ARN=arn:aws:connect:$AWS_REGION:622611388168:instance/7f36bde7-20e8-4c59-806a-256eb0b8feba
AWS_LAMBDA_GENERATE_VANITY_ARN=arn:aws:lambda:$AWS_REGION:622611388168:function:generate-vanity-numbers

echo "Generating .zip file for generate-vanity-numbers lambda..."
cd lambdas/generate-vanity-numbers || exit 1
npm install || exit 1
zip -r generate-vanity-numbers.zip . || exit 1
aws s3 cp generate-vanity-numbers.zip s3://$AWS_S3_DEPLOYMENT_BUCKET/ --region $AWS_REGION --profile $AWS_PROFILE || exit 1
rm generate-vanity-numbers.zip
cd ../.. || exit 1

echo "Executing the cloudformation template..."
aws cloudformation create-stack --stack-name cloud-foundry-coding-assessment \
  --template-body file://deployment/vanity_number_stack.json \
  --region $AWS_REGION \
  --profile $AWS_PROFILE \
  --capabilities CAPABILITY_NAMED_IAM


# todo: automated creation of connect instance config of contact-flow
#echo "Associating lambda function with Connect instance..."
#aws connect associate-lambda-function \
#  --region $AWS_REGION \
#  --profile $AWS_PROFILE \
#  --instance-id $AWS_CONNECT_INSTANCE_ARN \
#  --function-arn $AWS_LAMBDA_GENERATE_VANITY_ARN
#
#echo "Creating contact flow..."
#aws connect create-contact-flow \
#  --instance-id $AWS_CONNECT_INSTANCE_ARN \
#  --name "Generate Vanity Numbers" \
#  --type CONTACT_FLOW \
#  --region $AWS_REGION \
#  --profile $AWS_PROFILE \
#  --content file://deployment/contact-flow.json
