const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuid = require('uuid');

module.exports = async (normalizedNumber, digitsPrefix, validWordCombinations) => {

    // add a unique uuid for the item, the original number all vanity numbers were generated from, and the array of formatted vanity numbers
    await documentClient.put({
        TableName: 'cloud-foundry_coding-assessment_vanity-numbers',
        Item: {
            id: uuid.v4(),
            _timeStamp: new Date().toJSON(),
            numberType: 'VANITY_NUMBER',
            sourceNumber: normalizedNumber,
            vanityNumbers: getDynamoDBFormattedVanityNumbers(digitsPrefix, validWordCombinations)
        },
    }).promise().catch(error => {
        throw error;
    });
};

function getDynamoDBFormattedVanityNumbers(digitsPrefix, validWordCombinations) {

    // format the prefix to `X (XXX) `
    let formattedPrefix = `${digitsPrefix.substring(0, 1)} (${digitsPrefix.substring(1, 4)}) `;

    // iterate all valid word combinations and add '-' and capitalize for formatting
    let tempArray = [];
    for (let i = 0; i < validWordCombinations.length; i++) {
        if (validWordCombinations[i] && i < 5) {
            tempArray.push(`${formattedPrefix}${validWordCombinations[i].replace(/ /g, '-').toUpperCase()}`);
        }
    }
    return tempArray;
}
