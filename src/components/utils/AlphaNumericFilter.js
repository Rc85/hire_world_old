import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AlphaNumericFilter extends Component {
    render() {
        let filter = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-', '_'];

        return (
            <React.Fragment>
                {filter.map((letter, i) => {
                    return <div key={i} className={`filter-button ${this.props.currentLetter === letter ? 'active' : ''}`} onClick={() => this.props.filter(letter)}>{letter}</div>
                })}
            </React.Fragment>
        );
    }
}

AlphaNumericFilter.propTypes = {

};

export default AlphaNumericFilter;