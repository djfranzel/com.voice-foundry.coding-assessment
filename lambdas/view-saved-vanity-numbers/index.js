const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event) => {

    try {
        const response = await documentClient.query({
            TableName: 'cloud-foundry_coding-assessment_vanity-numbers',
            IndexName: 'numberType-_timeStamp-index',
            KeyConditionExpression: 'numberType = :numberType',
            ExpressionAttributeValues: {':numberType': 'VANITY_NUMBER'},
            Limit: 5,
            ScanIndexForward: false
        }).promise().catch(error => {
            throw error;
        });

        // allow cross-origin since web app is on another domain
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: 200,
            body: JSON.stringify(response.Items)
        };
    } catch (error) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: error.statusCode ? error.statusCode : 500,
            body: error.message ? error.message : 'Error retrieving data!'
        };
    }
};

function sortArrayByKey(array, key, order) {
    return array.sort((a, b) => {
        if (order === -1) return a[key] < b[key] ? 1 : -1;
        else return a[key] < b[key] ? -1 : 1;
    })
}
