const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event) => {

    try {
        const response = await documentClient.scan({
            TableName: 'cloud-foundry_coding-assessment_vanity-numbers'
        }).promise().catch(error => {
            throw error;
        });
        return {
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        return {
            statusCode: error.statusCode,
            body: error.message
        };
    }
};
