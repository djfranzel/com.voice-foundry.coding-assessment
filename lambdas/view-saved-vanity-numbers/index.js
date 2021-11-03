const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event) => {

    try {
        const response = await documentClient.scan({
            TableName: 'cloud-foundry_coding-assessment_vanity-numbers'
        }).promise().catch(error => {
            throw error;
        });

        let items = sortArrayByKey(response.Items, '_timeStamp', -1);
        let tempArray = [];
        for (let i = 0; i < items.length; i++) {
            if (i < 5) {
                tempArray.push(items[i]);
            } else {
                break;
            }
        }

        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: 200,
            body: JSON.stringify(tempArray)
        };
    } catch (error) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: error.statusCode,
            body: error.message
        };
    }
};

function sortArrayByKey(array, key, order) {
    return array.sort((a, b) => {
        if (order === -1) return a[key] < b[key] ? 1 : -1;
        else return a[key] < b[key] ? -1 : 1;
    })
}
