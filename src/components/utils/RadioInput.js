import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

class RadioInput extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            selected: null
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (this.props.selected !== nextProps.selected) {
            this.setState({selected: nextProps.selected});
        }
    }
    
    select(value) {
        if (!this.props.disabled) {
            this.setState({selected: value});
            this.props.onClick(value);
        }
    }
    
    render() {
        return (
            <div id={this.props.id ? this.props.id : ''} className={`radio-input-container ${this.props.rows ? 'radio-input-rows' : ''} ${this.props.className ? this.props.className : ''}`}>
                {this.props.items.map((item, i) => {
                    return <div key={i} id={item.id} className={`radio-input ${this.state.selected === item.value ? 'selected' : ''} ${item.className ? item.className : ''} ${this.props.disabled ? 'disabled' : ''}`} onClick={() => this.select(item.value)}>
                        {this.state.selected === item.value ? <div className='radio-input-selected border-blue'><FontAwesomeIcon icon={faCheck} /></div> : ''}

                        {item.text}
                    </div>
                })}
            </div>
        );
    }
}

RadioInput.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        text: PropTypes.string.isRequired,
        className: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired
    })),
    id: PropTypes.string,
    className: PropTypes.string,
};

export default RadioInput;