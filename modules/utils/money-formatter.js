module.exports = (value) => {
    let valueToCompare = parseFloat(value);
    let valueString = valueToCompare.toFixed(2);
    let val;

    // Hundreds
    if (valueToCompare < 1000) {
        val = valueString;
    // Thousands
    } else if (valueToCompare >= 1000 && valueToCompare < 10000) {
        val = valueString.charAt(0) + ',' + valueString.substr(1);
    // Ten thousands
    } else if (valueToCompare >= 10000 && valueToCompare < 100000) {
        val = valueString.substr(0, 2) + ',' + valueString.substr(2);
    // Hundred thousands
    } else if (valueToCompare >= 100000 && valueToCompare < 1000000) {
        val = valueString.substr(0, 3) + ',' + valueString.substr(3);
    // Million
    } else if (valueToCompare >= 1000000 && valueToCompare < 10000000) {
        val = valueString.charAt(0) + ',' + valueString.substr(1, 3) + ',' + valueString.substr(4);
    // Ten Million
    } else if (valueToCompare >= 10000000 && valueToCompare < 100000000) {
        val = valueString.substr(0, 2) + ',' + valueString.substr(2, 3) + ',' + valueString.substr(5);
    // Hundred Million
    } else if (valueToCompare >= 100000000 && valueToCompare < 1000000000) {
        val = valueString.substr(0, 3) + ',' + valueString.substr(3, 3) + ',' + valueString.substr(6);
    } else if (valueToCompare >= 1000000000 && valueToCompare < 10000000000) {
        val = valueString.charAt(0) + ',' + valueString.substr(1, 3) + ',' + valueString.substr(4, 3) + ',' + valueString.substr(7);
    }

    return val;
}