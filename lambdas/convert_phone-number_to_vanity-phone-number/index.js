const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const uuid = require('uuid');

const top5000EnglishWords = require('./top-5000-english-words');
const letterMap = {
    '2': ['a', 'b', 'c'],
    '3': ['d', 'e', 'f'],
    '4': ['g', 'h', 'i'],
    '5': ['j', 'k', 'l'],
    '6': ['m', 'n', 'o'],
    '7': ['p', 'q', 'r', 's'],
    '8': ['t', 'u', 'v'],
    '9': ['w', 'x', 'y', 'z'],
};

// todo: better guards/validation for bad data coming in
exports.handler = async (event) => {

    // extract the number from the payload
    let payload = event.toString();

    // normalize number by removing all non-number chars
    // todo: this allows a lot of junk, so perhaps require tighter formats
    let normalizedNumber = payload.toString().replace(/\D/g, '');

    if (normalizedNumber.length !== 11) {
        return {
            statusCode: 500,
            body: 'Invalid phone number! Please provide 11-digit phone number.',
        };
    }

    // extract digits for prefix, which remains in number format
    const digitsPrefix = normalizedNumber.substring(0, 4);

    // extract digits to attempt conversion to words
    const digitsToUse = normalizedNumber.substring(4, 11);

    // todo: create conditions where can return strings with 0 and/or 1 included
    if (digitsToUse.includes('1') || digitsToUse.includes('0')) {
        return {
            statusCode: 500,
            body: `Can not create vanity number when '1' or '0' are included! These numbers have no associated letters.`,
        };
    }

    // get all of the valid word combinations for a given number set
    let validWordCombinations = getValidWordCombinations(digitsToUse);
    const formattedVanityNumbers = getFormattedVanityNumbers(digitsPrefix, validWordCombinations);

    // put items into dynamoDB
    try {

        // add a unique uuid for the item, the original number all vanity numbers were generated from, and the array of vanity numbers
        const item = {
            id: uuid.v4(),
            _timeStamp: new Date().toJSON(),
            sourceNumber: normalizedNumber,
            vanityNumbers: formattedVanityNumbers
        };
        await documentClient.put({
            TableName: 'cloud-foundry_coding-assessment_vanity-numbers',
            Item: item,
        }).promise().catch(error => {
            throw error;
        });
    } catch (error) {
        return {
            statusCode: 500,
            error: error.message
        }
    }

    return {
        statusCode: 200,
        body: formattedVanityNumbers
    };
};

// todo: there is probably a way to do this using recursion, but this works fine because our max char count is 7, and so anything more than 3 words is cumbersome
function getValidWordCombinations(digitsToUse) {

    // split into an array for easy iterating
    const digitsArray = digitsToUse.split('');

    // get the array of words for the first possible combination
    let firstWordList = getPossibleWordsFromNumberSet(digitsArray);

    let validWordCombinations = [];

    // iterate over this first word list to start creating valid vanity numbers
    for (let firstWord of firstWordList) {

        // if the first word is enough, push it into the array and move on
        if (firstWord.length >= 7) {
            validWordCombinations.push(firstWord);
            continue;
        }

        // get second set of digits
        let secondNewDigits = getNewDigits(firstWord, digitsArray);

        // get the second word list that correspond to the digit set
        let secondWordList = getPossibleWordsFromNumberSet(secondNewDigits);

        for (let secondWord of secondWordList) {

            // if the combination of the first and second words are enough, push and move on
            if (firstWord.length + secondWord.length >= 7) {
                validWordCombinations.push(firstWord + ' ' + secondWord);
                continue;
            }

            // get third digit set from the second digit set
            let thirdNewDigits = getNewDigits(secondWord, secondNewDigits);

            // grab the third set of words from corresponding number set
            let thirdWordList = getPossibleWordsFromNumberSet(thirdNewDigits);

            for (let thirdWord of thirdWordList) {
                if (firstWord.length + secondWord.length + thirdWord.length >= 7) {
                    validWordCombinations.push(firstWord + ' ' + secondWord + ' ' + thirdWord);
                }
            }
        }
    }
    return validWordCombinations;
}

function getFormattedVanityNumbers(digitsPrefix, validWordCombinations) {

    // format the prefix to `1 (800) `
    let formattedPrefix = `${digitsPrefix.substring(0, 1)} (${digitsPrefix.substring(1, 4)}) `;

    // iterate all valid word combinations and add '-' and capitalize for formatting
    let tempArray = [];
    for (let number of validWordCombinations) {
        tempArray.push(`${formattedPrefix}${number.replace(/ /g, '-').toUpperCase()}`);
    }
    return tempArray;
}

function getNewDigits(word, oldDigits) {

    // create a copy of the oldDigits to prevent unwanted object manipulation
    let digitsArrayCopy = JSON.parse(JSON.stringify(oldDigits));

    // remove one item in the array for each word char since these are now used
    for (let char of word) {
        digitsArrayCopy.shift();
    }
    return digitsArrayCopy;
}

function getPossibleWordsFromNumberSet(numberSet) {

    // set an empty word set array to populate with possible word combinations
    let wordSet = [];

    // iterate through 5000 most common english words
    for (let word of top5000EnglishWords) {

        // split the word being checked into an iterable array
        let splitWord = word.split('');

        // there must be numbers to iterate, and the word can be a maximum of 2 chars longer than available numbers
        // this allows 1 (800) CALL-BILL to be valid - phones will disregard last 'L'
        const notTooLarge = numberSet.length > 0 && splitWord.length < numberSet.length + 2;

        if (notTooLarge) {

            // set the matches variable to true, and switch to false if the word fails a condition
            let matches = true;

            // loop through either the length of the word or the number set, whichever is less
            // this enables words to return that complete just part of the number sequence
            const loopLength = Math.min(splitWord.length, numberSet.length);

            for (let i = 0; i < loopLength; i++) {

                // if the letterMap doesn't have the number or if the char from the split word doesn't exist for the number
                // set matches to false and break loop for efficiency
                if (!letterMap[numberSet[i]] || !letterMap[numberSet[i]].includes(splitWord[i])) {
                    matches = false;
                    break;
                }
            }

            // push the words that match to the set
            if (matches) {
                wordSet.push(word);
            }
        }
    }
    return wordSet
}
