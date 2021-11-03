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

        // sort most recent first and return just top 5
        // todo: this call could be optimized with a query instead of a scan for better performance
        let items = sortArrayByKey(response.Items, '_timeStamp', -1);
        let mostRecentFive = [];
        for (let i = 0; i < items.length; i++) {
            if (i < 5) {
                mostRecentFive.push(items[i]);
            } else {
                break;
            }
        }

        // allow cross-origin since web app is on another domain
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            statusCode: 200,
            body: JSON.stringify(mostRecentFive)
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
