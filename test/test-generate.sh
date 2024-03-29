#!/bin/bash

# to test non US-based number
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+26124333552"}}}}' --region us-east-1 --profile personal response.json

## to test wrong format
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+126124333552"}}}}' --region us-east-1 --profile personal response.json

## to test non-existing
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":""}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"PhoneNumber":"+17632216079"}' --region us-east-1 --profile personal response.json

## to test successful cases
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+17631925538"}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+17633231323"}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+17631323323"}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+17633233231"}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+17637822312"}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+16124333552"}}}}' --region us-east-1 --profile personal response.json
aws lambda invoke --function-name generate-vanity-numbers --cli-binary-format raw-in-base64-out --payload '{"Details":{"ContactData":{"CustomerEndpoint":{"Address":"+16122222222"}}}}' --region us-east-1 --profile personal response.json
