Run this command to invoke the function and test the results:

`aws lambda invoke --function-name convert_phone-number_to_vanity-phone-number out --payload '{"beer": "tasty"}' --log-type Tail --region us-east-2 --profile personal`