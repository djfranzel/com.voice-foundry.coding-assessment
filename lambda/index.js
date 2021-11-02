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
    let normalizedNumber = payload.toString().replace(/\D/g, '');

    // check that phone number is in required format
    if (normalizedNumber.length !== 11) {
        return {
            statusCode: 500,
            body: 'Invalid phone number! Please provide 11-digit phone number.',
        };
    }

    // extract digits from index 4 to 10
    const digitsPrefix = normalizedNumber.substring(0, 4);
    const digitsToUse = normalizedNumber.substring(4, 11);

    // check if digitsToUse includes 1, since there are no characters associated with 1
    if (digitsToUse.includes('1') || digitsToUse.includes('0')) {
        return {
            statusCode: 500,
            body: `Can not create vanity number when '1' or '0' are included! These numbers have no associated letters.`,
        };
    }

    // split into an array for easy iterating
    let digitsArray = digitsToUse.split('');

    // set an empty array for potential vanity numbers
    let vanityNumbers = [];

    // get the array of words for the first possible combination
    let firstWordList = getWordFromNumbers(digitsArray);

    // iterate over this first word list
    for (let firstWord of firstWordList) {

        // if the first word is enough, push it into the array and move on
        if (firstWord.length >= 7) {
            vanityNumbers.push(firstWord);
            continue;
        }

        let secondWordList = [];
        let thirdWordList = [];

        // get second set of digits
        let secondNewDigits = getNewDigits(firstWord, digitsArray);

        // get the second word list that correspond to the digit set
        secondWordList = getWordFromNumbers(secondNewDigits);

        for (let secondWord of secondWordList) {

            // if the combination of the first and seconds words are enough, push and move on
            if (firstWord.length + secondWord.length >= 7) {
                vanityNumbers.push(firstWord + ' ' + secondWord);
                continue;
            }

            // get third digit set from the second digit set
            let thirdNewDigits = getNewDigits(secondWord, secondNewDigits);

            // grab the third set of words from corresponding number set
            thirdWordList = getWordFromNumbers(thirdNewDigits);

            for (let thirdWord of thirdWordList) {
                if (firstWord.length + secondWord.length + thirdWord.length >= 7) {
                    vanityNumbers.push(firstWord + ' ' + secondWord + ' ' + thirdWord);
                }
            }
        }

    }

    return {
        statusCode: 200,
        body: formatVanityNumbers(digitsPrefix, vanityNumbers)
    };
};

function formatVanityNumbers(digitsPrefix, vanityNumbers) {
    let tempArray = [];
    let formattedPrefix = `${digitsPrefix.substring(0, 1)} (${digitsPrefix.substring(1, 4)}) `;
    for (let number of vanityNumbers) {
        tempArray.push(`${formattedPrefix}${number.replace(/ /g, '-').toUpperCase()}`);
    }
    return tempArray;
}

function getNewDigits(word, oldDigits) {
    let digitsArrayCopy = JSON.parse(JSON.stringify(oldDigits));
    for (let char of word) {
        digitsArrayCopy.shift();
    }
    return digitsArrayCopy;
}

function getWordFromNumbers(numberSet) {

    // set an empty word set array to populate with possible word combinations
    let wordSet = [];
    for (let word of top5000EnglishWords) {

        // split the word being checked into an iterable array
        let splitWord = word.split('');

        // set the matches variable to true, and switch to false if the word fails a condition
        let matches = true;

        // iterate that array and run a series of checks
        const loopLength = Math.min(splitWord.length, numberSet.length);
        const notTooLarge = splitWord.length < numberSet.length + 2 && numberSet.length > 0;
        if (notTooLarge) {
            for (let i = 0; i < loopLength; i++) {
                if (!letterMap[numberSet[i]] || !letterMap[numberSet[i]].includes(splitWord[i])) {
                    matches = false;
                    break;  // exit this loop since the word fails!
                }
            }
            if (matches) {
                wordSet.push(word);
            }
        }
    }
    return wordSet
}
