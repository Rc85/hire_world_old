import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AlphaNumericFilter extends Component {
    render() {
        let filter = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '-', '_', 'All'];

        return (
            <React.Fragment>
                <div className='filter-buttons'>
                    {filter.map((letter, i) => {
                        return <div key={i} className={`filter-button ${this.props.currentLetter === letter ? 'active' : ''}`} onClick={() => this.props.filter(letter)}>{letter}</div>
                    })}
                </div>

                <div className='filter-dropdown'>
                    <select onChange={(e) => this.props.filter(e.target.value)}>
                        {filter.map((letter, i) => {
                            return <option value={letter} key={i}>{letter}</option>
                        })}
                    </select>
                </div>
            </React.Fragment>
        );
    }
}

AlphaNumericFilter.propTypes = {

};

export default AlphaNumericFilter;