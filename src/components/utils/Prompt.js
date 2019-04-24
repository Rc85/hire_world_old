import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PromptReset, PromptSubmit } from '../../actions/PromptActions';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';
import { IsTyping } from '../../actions/ConfigActions';

class Prompt extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            input: this.props.value ? this.props.value : ''
        }
    }

    componentDidMount() {
        let modal = document.getElementById('prompt-modal');
        modal.style.top = `${window.pageYOffset}px`;
        document.body.style.overflowY = 'hidden';
    }

    componentWillUnmount() {
        document.body.style.overflowY = 'auto';
    }
    
    render() {
        return (
            <div id='prompt-modal' className='full-black-overlay'>
                <div className='modal-container w-25 rounded'>
                    <div className='text-black'>{this.props.text}</div>

                    <input type={this.props.data.type ? this.props.data.type : 'text'} value={this.state.input} name='prompt' id='prompt-input'className='mb-1' onChange={(e) => this.setState({input: e.target.value})} autoFocus='on' onKeyDown={(e) => {
                        if (e.keyCode === 13) {
                            if (this.state.input) {
                                this.props.dispatch(PromptSubmit(this.state.input, this.props.data));
                            } else {
                                this.props.dispatch(Alert('error', 'Cannot be blank'));
                            }
                        }
                    }} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />

                    <div className='text-right'>
                        <button className='btn btn-primary mr-1' onClick={() => {
                            if (this.state.input) {
                                this.props.dispatch(PromptSubmit(this.state.input, this.props.data));
                            } else {
                                this.props.dispatch(Alert('error', 'Cannot be blank'));
                            }
                        }}>Submit</button>
                        <button className='btn btn-secondary' onClick={() => this.props.dispatch(PromptReset())}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }
}

Prompt.propTypes = {
    text: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.object
    ]),
    data: PropTypes.object
};

export default connect()(Prompt);