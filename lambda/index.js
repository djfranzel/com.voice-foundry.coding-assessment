
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

exports.handler = async (event) => {

    // remove all non-number chars
    let payload = event.toString();
    let normalizedNumber = payload.replace(/\D/g, '');

    // check that phone number is in required format
    if (normalizedNumber.length !== 11) {
        return {
            statusCode: 500,
            body: 'Invalid phone number! Please provide 11-digit phone number.',
        };
    }

    // extract digits from index 4 to 10
    const digitsPrefix = normalizedNumber.substring(0, 4);
    const digitsToUse = normalizedNumber.substring(4,11);

    // check if digitsToUse includes 1, since there are no characters associated with 1
    if (digitsToUse.includes('1')) {
        return {
            statusCode: 500,
            body: `Can not create vanity number when '1' is included! There are no associated letters for number '1'.`,
        };
    }

    // split into an array for easy iterating
    let digitsArray = digitsToUse.split('');

    // set an empty array for potential vanity numbers
    let vanityNumbers = [];

    // iterate over 5000 words and find combinations that match this number set
    // this is faster than creating all possible words from the 7 numbers since that is a giant number
    for (let word of top5000EnglishWords) {
        let splitWord = word.split('');
        if (word.length >= 7) {
            let counter = true;
            for (let i = 0; i < digitsArray.length; i++) {
                if (letterMap[digitsArray[i]] && !letterMap[digitsArray[i]].includes(splitWord[i])) {
                    counter = false;
                }
            }
            if (counter) {
                let number = `${digitsPrefix}-${word.toUpperCase()}`;
                vanityNumbers.push(number);
            }
        }
    }

    return {
        statusCode: 200,
        body: vanityNumbers
    };
};