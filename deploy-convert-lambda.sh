

echo "Running 'npm install' on lambda function..."
cd lambdas/convert_phone-number_to_vanity-phone-number || exit 1
npm install || exit 1

echo "Zipping package for deployment to AWS Lambda..."
zip -r lambda-deployment-package.zip . || exit 1

echo "Updating Lambda function with updated code..."
aws lambda update-function-code --function-name convert_phone-number_to_vanity-phone-number --zip-file fileb://lambda-deployment-package.zip --region us-east-2 --profile personal || exit 1

echo "Invoking function to test..."
aws lambda invoke --function-name convert_phone-number_to_vanity-phone-number out --payload '18002345678' --log-type Tail --region us-east-2 --profile personal
