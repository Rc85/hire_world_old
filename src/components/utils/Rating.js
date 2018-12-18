import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

class StarSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            starActive: this.props.stars || 0
        }
    }
    
    render() {
        return (
            <div className='d-flex'>
                <div className={`${this.state.starActive >= 1 ? 'review-star active' : 'review-star'} mr-1`}
                onClick={() => this.props.set(1)}
                onMouseOver={() => this.setState({starActive: 1})}
                onMouseOut={() => this.setState({starActive: this.props.stars})}>
                    <FontAwesomeIcon icon={faStar} />
                </div>

                <div className={`${this.state.starActive >= 2 ? 'review-star active' : 'review-star'} mr-1`}
                onClick={() => this.props.set(2)}
                onMouseOver={() => this.setState({starActive: 2})}
                onMouseOut={() => this.setState({starActive: this.props.stars})}>
                    <FontAwesomeIcon icon={faStar} />
                </div>

                <div className={`${this.state.starActive >= 3 ? 'review-star active' : 'review-star'} mr-1`}
                onClick={() => this.props.set(3)}
                onMouseOver={() => this.setState({starActive: 3})}
                onMouseOut={() => this.setState({starActive: this.props.stars})}>
                    <FontAwesomeIcon icon={faStar} />
                </div>

                <div className={`${this.state.starActive >= 4 ? 'review-star active' : 'review-star'} mr-1`}
                onClick={() => this.props.set(4)}
                onMouseOver={() => this.setState({starActive: 4})}
                onMouseOut={() => this.setState({starActive: this.props.stars})}>
                    <FontAwesomeIcon icon={faStar} />
                </div>

                <div className={`${this.state.starActive >= 5 ? 'review-star active' : 'review-star'} mr-1`}
                onClick={() => this.props.set(5)}
                onMouseOver={() => this.setState({starActive: 5})}
                onMouseOut={() => this.setState({starActive: this.props.stars})}>
                    <FontAwesomeIcon icon={faStar} />
                </div>
            </div>
        );
    }
}

StarSelector.propTypes = {
    stars: PropTypes.number,
    set: PropTypes.func,
    sent: PropTypes.bool
};

export default StarSelector;