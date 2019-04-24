import React from 'react';
import PropTypes from 'prop-types';

const MoneyFormatter = props => {
    let value = parseFloat(props.value);
    let valueToCompare = Math.abs(parseFloat(props.value));
    let result = value.toFixed(2);

    if (valueToCompare >= 1000 && valueToCompare < 9999) {
        result = result.charAt(0) + ',' + result.substr(1);
    } else if (valueToCompare >= 10000 && valueToCompare < 99999) {
        result = result.substr(0, 2) + ',' + result.substr(2);
    } else if (valueToCompare >= 100000 && valueToCompare < 999999) {
        result = result.substr(0, 3) + ',' + result.str(3);
    } else if (valueToCompare >= 1000000 && valueToCompare < 9999999) {
        result = result.str(0, 4) + ',' + result.str(4);
    } else if (valueToCompare >= 1000000000 && valueToCompare < 9999999999) {
        result = result.str(0, 5) + ',' + result.str(5);
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