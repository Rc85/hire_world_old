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

    let input;

    if (props.type === 'select') {
        input = <select id={props.inputId} onChange={(e) => props.onChange(e.target.value)} value={props.value} className='w-100' disabled={props.disabled} name={props.name}>
            {props.children}
        </select>;
    } else {
        input = <input type={props.type} name={props.name} id={props.inputId} onChange={(e) => props.onChange(e.target.value)} onKeyDown={(e) => handleKeyDown(e)} disabled={props.disabled} value={props.value} className='w-100' onFocus={() => props.dispatch(isTyping(true))} onBlur={() => props.dispatch(isTyping(false))} />;

        if (props.dataList) {
            input = <React.Fragment>
                <input type={props.type} name={props.name} id={props.inputId} list={props.dataList} onChange={(e) => props.onChange(e.target.value)} onKeyDown={(e) => handleKeyDown(e)} disabled={props.disabled} value={props.value} className='w-100' onFocus={() => props.dispatch(isTyping(true))} onBlur={() => props.dispatch(isTyping(false))} />
                <datalist id={props.dataList}>
                    {props.children}
                </datalist>
            </React.Fragment>;
        }
    }

    return(
        <div id={props.id} className={`input-container ${props.className ? props.className : ''}`}>
            <div className='input-container-header'>
                <label className={`${props.labelBgColor ? `bg-${props.labelBgColor}` : ''}`}>{props.label}</label>
                {props.altLabel ? <label className={props.altLabelClassName ? props.altLabelClassName : ''}>{props.altLabel}</label> : ''}
            </div>

            {input}
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