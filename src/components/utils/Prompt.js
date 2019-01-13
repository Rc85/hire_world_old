import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PromptReset, PromptSubmit } from '../../actions/PromptActions';
import { connect } from 'react-redux';
import { Alert } from '../../actions/AlertActions';

class Prompt extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            input: ''
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
                    <div className='modal-text'>{this.props.text}</div>

                    <input type='text' name='prompt' id='prompt-input'className='mb-1' onChange={(e) => this.setState({input: e.target.value})} autoFocus='on' onKeyDown={(e) => {
                        if (e.keyCode === 13) {
                            if (this.state.input) {
                                this.props.dispatch(PromptSubmit(this.state.input, this.props.data));
                            } else {
                                this.props.dispatch(Alert('error', 'Please specify a reason'));
                            }
                        }
                    }} />

                    <div className='text-right'>
                        <button className='btn btn-primary mr-1' onClick={() => {
                            if (this.state.input) {
                                this.props.dispatch(PromptSubmit(this.state.input, this.props.data));
                            } else {
                                this.props.dispatch(Alert('error', 'Please specify a reason'));
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
    data: PropTypes.object
};

export default connect()(Prompt);