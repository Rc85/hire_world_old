import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const InputWrapper = props => {
    return(
        <div id={props.id} className={`input-container ${props.className ? props.className : ''}`}>
            <div className='input-container-header'>
                <label className={`${props.labelBgColor ? `bg-${props.labelBgColor}` : ''}`}>{props.label}</label>
                {props.altLabel ? <label className={props.altLabelClassName ? props.altLabelClassName : ''}>{props.altLabel}</label> : ''}
            </div>

            {props.required ? <div className='input-required'><span className='text-special'>*</span> <small className='text-muted'><em>Required</em></small></div> : ''}

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