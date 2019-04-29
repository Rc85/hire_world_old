import PropTypes from 'prop-types';

const MoneyFormatter = props => {
    let value = parseFloat(props.value);
    let isNegative = false;

    if (value < 0) {
        isNegative = true;
    }

    let valueToCompare = Math.abs(parseFloat(props.value));
    let result = valueToCompare.toFixed(2);

    // Thousands
    if (valueToCompare >= 1000 && valueToCompare < 9999) {
        result = result.charAt(0) + ',' + result.substr(1);
    // Ten thousands
    } else if (valueToCompare >= 10000 && valueToCompare < 99999) {
        result = result.substr(0, 2) + ',' + result.substr(2);
    // Hundred thousands
    } else if (valueToCompare >= 100000 && valueToCompare < 999999) {
        result = result.substr(0, 3) + ',' + result.substr(3);
    // Million
    } else if (valueToCompare >= 1000000 && valueToCompare < 9999999) {
        result = result.charAt(0) + ',' + result.substr(1, 3) + ',' + result.substr(4);
    // Ten Million
    } else if (valueToCompare >= 10000000 && valueToCompare < 99999999) {
        result = result.substr(0, 2) + ',' + result.substr(2, 3) + ',' + result.substr(5);
    // Hundred Million
    } else if (valueToCompare >= 100000000 && valueToCompare < 999999999) {
        result = result.substr(0, 3) + ',' + result.substr(3, 3) + ',' + result.substr(6);
    } else if (valueToCompare >= 1000000000 && valueToCompare < 9999999999) {
        result = result.charAt(0) + ',' + result.substr(1, 3) + ',' + result.substr(4, 3) + ',' + result.substr(7);
    }

    if (isNegative) {
        result = '-' + result;
    }

    return result;
}

MoneyFormatter.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default MoneyFormatter;