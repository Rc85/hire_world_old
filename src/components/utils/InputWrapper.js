import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const InputWrapper = props => {
    return(
        <div id={props.id} className={`input-container ${props.className ? props.className : ''} ${props.disabled ? 'disabled' : ''}`}>
            <div className='input-container-header'>
                <label className={`${props.labelBgColor ? `bg-${props.labelBgColor}` : ''}`}>{props.label}</label>
                {props.altLabel ? <label className={`alt-label ${props.altLabelClassName ? props.altLabelClassName : ''}`}>{props.altLabel}</label> : ''}
                {props.required ? <label className='required-label'><span className='text-special'>*</span></label> : ''}
            </div>

            {props.children}
        </div>
    )
}

InputWrapper.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    labelBgColor: PropTypes.string
};

export default connect()(InputWrapper);