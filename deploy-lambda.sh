

echo "Running 'npm install' on lambda function..."
cd lambda || exit 1
npm install || exit 1

echo "Zipping package for deployment to AWS Lambda..."
zip -r ../lambda-deployment-package.zip . || exit 1
cd .. || exit 1

echo "Updating Lambda function with updated code..."
aws lambda update-function-code --function-name convert_phone-number_to_vanity-phone-number --zip-file fileb://lambda-deployment-package.zip --region us-east-2 --profile personal || exit 1

echo "Deleting lambda deployment package..."
rm lambda-deployment-package.zip

echo "Invoking function to test..."
aws lambda invoke --function-name convert_phone-number_to_vanity-phone-number out --payload '18002222222' --log-type Tail --region us-east-2 --profile personal