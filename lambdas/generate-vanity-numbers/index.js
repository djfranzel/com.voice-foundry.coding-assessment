const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
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
const numberMap = {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
};
const numberOrderMap = {
    0: 'first',
    1: 'second',
    2: 'third',
};

exports.handler = async (event) => {

    // extract the number from the request
    let callerNumber = event?.Details?.ContactData?.CustomerEndpoint?.Address;

    // the number should be in a consistent format, but normalize anyway just to be sure
    let normalizedNumber = callerNumber?.toString()?.replace(/\D/g, '');

    // set validation and error messages if there is no number, not US-based, or not 11 digits
    if (!normalizedNumber) {

        // set error messages, lot them, and return them to the user
        const message = `Could not retrieve your phone number.`;
        console.error(`${message} Number: ${normalizedNumber}`);
        console.error('Event: ' + event);
        return {
            PreSpeech: '',
            MainResponse: message
        };
    } else if (normalizedNumber[0] !== '1') {

        // set error messages, lot them, and return them to the user
        const message = `We currently only support vanity number generation from US-based numbers.`;
        console.error(`${message} Number: ${normalizedNumber}`);
        console.error('Event: ' + event);
        return {
            PreSpeech: '',
            MainResponse: message
        };
    } else if (normalizedNumber.length !== 11) {

        // set error messages, lot them, and return them to the user
        const message = `Number format not recognized.`;
        console.error(`${message} Number: ${normalizedNumber}`);
        console.error('Event: ' + event);
        return {
            PreSpeech: '',
            MainResponse: message
        };
    }

    // extract digits for prefix, which remains in number format
    const digitsPrefix = normalizedNumber.substring(0, 4);

    // extract digits to attempt conversion to words
    const digitsToUse = normalizedNumber.substring(4, 11);

    // grab all possible vanity numbers
    const oneWordVanity = getOneWordVanity(digitsToUse, 5);
    const twoWordVanity = getTwoWordVanity(digitsToUse, 5);
    const threeWordVanity = getThreeWordVanity(digitsToUse, 5);

    // this concat order determines which ones get kept
    let validWordCombinations = oneWordVanity.concat(twoWordVanity).concat(threeWordVanity);

    // put items into dynamoDB
    try {

        // add a unique uuid for the item, the original number all vanity numbers were generated from, and the array of formatted vanity numbers
        const item = {
            id: uuid.v4(),
            _timeStamp: new Date().toJSON(),
            numberType: 'VANITY_NUMBER',
            sourceNumber: normalizedNumber,
            vanityNumbers: getDynamoDBFormattedVanityNumbers(digitsPrefix, validWordCombinations)
        };
        await documentClient.put({
            TableName: 'cloud-foundry_coding-assessment_vanity-numbers',
            Item: item,
        }).promise().catch(error => {
            throw error;
        });
    } catch (error) {
        console.error('Error posting data to DynamoDB! error: ' + error);
        return {
            PreSpeech: '',
            MainResponse: 'Error generating vanity numbers.'
        }
    }

    let preSpeech = '';
    let mainResponse = '';

    // check that words were returned, and generate messages accordingly
    if (!validWordCombinations || !validWordCombinations.length) {
        preSpeech = 'We were unable to generate any vanity numbers for you phone number.';
    } else {
        const length = validWordCombinations.length;
        preSpeech = `${length} vanity number${length > 1 ? 's' : ''} generated: `;
        // format the vanity number response so computer speaker can speak it intelligibly
        mainResponse = getConnectFormattedVanityNumbers(digitsPrefix, validWordCombinations);
    }

    // log response for visibility
    console.log('preSpeech:' + preSpeech);
    console.log('mainResponse:' + mainResponse);
    return {
        PreSpeech: preSpeech,
        MainResponse: mainResponse
    };
};

function getOneWordVanity(digitsToUse, limit) {

}

function getTwoWordVanity(digitsToUse, limit) {

}

function getThreeWordVanity(digitsToUse, limit) {

}

// only allow up to two total 0/1's in number since more than that returns a vanity number that is ugly and not meaningful
function getWordCombinations01Case(digitsToUse, limit) {

    // extract all 0/1's and insert in order into an array to splice in later on returned numbers
    let zeroOneDigits = [];
    for (let digit of digitsToUse) {
        if (digit === '0' || digit === '1') {
            zeroOneDigits.push(digit)
        }
    }

    // if there are simply too many 0/1's to create a meaningful vanity number, just return an empty array
    if (zeroOneDigits.length > 2) {
        // todo: how to include a message here so the user knows number is rejected?
        return [];
    }

    // set a limit on the count since presence of 0/1's reduce the possible word length
    const wordLengthLimit = 7 - zeroOneDigits.length;

    // creates an array that is fully split on 0's and 1's '2216079' -> ['22', '6', '79']
    let splitOnOne = digitsToUse.split('1');
    let fullySplit = [];
    for (let digitSet of splitOnOne) {
        fullySplit = fullySplit.concat(digitSet.split('0'));
    }

    // grab the number sets from the split array and generate words from those numbers
    let firstWordList = fullySplit[0] ? getPossibleWordsFromNumberSet(fullySplit[0], 0) : [];
    let secondWordList = fullySplit[1] ? getPossibleWordsFromNumberSet(fullySplit[1], 0) : [];
    let thirdWordList = fullySplit[2] ? getPossibleWordsFromNumberSet(fullySplit[2], 0) : [];
    console.log(fullySplit)
    console.log(firstWordList)
    console.log(secondWordList)
    console.log(thirdWordList)

    // get the array of words for the first possible combination
    let validWordCombinations = [];

    // iterate over this first word list to start creating valid vanity numbers
    for (let firstWord of firstWordList) {

        // if the first word is enough, push it into the array and move on
        if (firstWord.length === wordLengthLimit) {
            validWordCombinations.push(firstWord + ' ' + zeroOneDigits[0]);
            if (validWordCombinations.length >= limit) {
                return validWordCombinations;
            }
            continue;
        }

        for (let secondWord of secondWordList) {

            // if the combination of the first and second words are enough, push and move on
            if (firstWord.length + secondWord.length === wordLengthLimit) {
                validWordCombinations.push(firstWord + ' ' + zeroOneDigits[0] + ' ' + secondWord);
                if (validWordCombinations.length >= limit) {
                    return validWordCombinations;
                }
                continue;
            }

            for (let thirdWord of thirdWordList) {
                if (firstWord.length + secondWord.length + thirdWord.length === wordLengthLimit) {
                    validWordCombinations.push(firstWord + ' ' + zeroOneDigits[0] + ' ' + secondWord + ' ' + zeroOneDigits[1] + ' ' + thirdWord);
                    if (validWordCombinations.length >= limit) {
                        return validWordCombinations;
                    }
                }
            }
        }
    }
    return validWordCombinations;
}

// this function limits response to three words as four+ words is odd and less memorable - 1 (800) AH-HA-NO-IT
// return only as much as desired for the limit, with priority on longer words first
function getValidWordCombinations(digitsToUse, limit) {

    // split into an array for easy iterating
    const digitsArray = digitsToUse.split('');

    // get the array of words for the first possible combination
    let firstWordList = getPossibleWordsFromNumberSet(digitsArray, 2);

    let validWordCombinations = [];

    // iterate over this first word list to start creating valid vanity numbers
    for (let firstWord of firstWordList) {

        // if the first word is enough, push it into the array and move on
        if (firstWord.length >= 7) {
            validWordCombinations.push(firstWord);
            if (validWordCombinations.length >= limit) {
                return validWordCombinations;
            }
            continue;
        }

        // get second set of digits
        let secondNewDigits = getNewDigits(firstWord, digitsArray);

        // get the second word list that correspond to the digit set
        let secondWordList = getPossibleWordsFromNumberSet(secondNewDigits, 2);

        for (let secondWord of secondWordList) {

            // if the combination of the first and second words are enough, push and move on
            if (firstWord.length + secondWord.length >= 7) {
                validWordCombinations.push(firstWord + ' ' + secondWord);
                if (validWordCombinations.length >= limit) {
                    return validWordCombinations;
                }
                continue;
            }

            // get third digit set from the second digit set
            let thirdNewDigits = getNewDigits(secondWord, secondNewDigits);

            // grab the third set of words from corresponding number set
            let thirdWordList = getPossibleWordsFromNumberSet(thirdNewDigits, 2);

            for (let thirdWord of thirdWordList) {
                if (firstWord.length + secondWord.length + thirdWord.length >= 7) {
                    validWordCombinations.push(firstWord + ' ' + secondWord + ' ' + thirdWord);
                    if (validWordCombinations.length >= limit) {
                        return validWordCombinations;
                    }
                }
            }
        }
    }
    return validWordCombinations;
}

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

function getConnectFormattedVanityNumbers(digitsPrefix, validWordCombinations) {

    // format the prefix with separated numbers so voice will speak them slower and more clearly
    let formattedDigitsPrefix =
        `${digitsPrefix[0]}, ${digitsPrefix[1]} ${digitsPrefix[2]} ${digitsPrefix[3]},`;

    // iterate over all validWordCombinations to the limit but not more than 3
    let finalFormattedString = '';
    for (let i = 0; i < validWordCombinations.length; i++) {
        if (validWordCombinations[i] && i < 3) {

            // prepend the digits prefix and push to returned array
            finalFormattedString += `${numberOrderMap[i]} number: ${formattedDigitsPrefix}${validWordCombinations[i]}, `;
        } else {
            break;
        }
    }

    return finalFormattedString;
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

function getPossibleWordsFromNumberSet(numberSet, additionalWordLength) {

    // set an empty word set array to populate with possible word combinations
    let wordSet = [];

    // iterate through 5000 most common english words
    for (let word of top5000EnglishWords) {

        // split the word being checked into an iterable array
        let splitWord = word.split('');

        // there must be numbers to iterate, and the word cannot be longer than the numberSet plus any additional word length
        // this allows 1 (800) CALL-BILL to be valid - phones will disregard last 'L'
        const notTooLarge = numberSet.length > 0 && splitWord.length <= numberSet.length + additionalWordLength;

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
    return wordSet;
}
