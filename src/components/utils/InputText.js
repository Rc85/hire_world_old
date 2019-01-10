import React from 'react';
import PropTypes from 'prop-types';
import { isTyping } from '../../actions/ConfigActions';
import { connect } from 'react-redux';

const InputText = props => {
    const handleKeyDown = e => {
        if (e.keyCode === 13) {
            props.nextInput();
        } else {
            return
        }
    }

    return(
        <div id={props.id} className={`input-container ${props.className}`}>
            <label className={`${props.labelBgColor ? `bg-${props.labelBgColor}` : ''}`}>{props.label}</label>

            <input type={props.type} name={props.name} id={props.inputId} onChange={(e) => props.onChange(e.target.value)} onKeyDown={(e) => handleKeyDown(e)} disabled={props.disabled} value={props.value} className='w-100' onFocus={() => this.props.dispatch(isTyping(true))} onBlue={() => this.props.dispatch(isTyping(false))} />
        </div>
    )
}

InputText.propTypes = {
    onChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    type: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    labelBgColor: PropTypes.string
};

export default connect()(InputText);