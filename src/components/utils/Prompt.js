import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PromptReset, PromptSubmit } from '../../actions/PromptActions';
import { connect } from 'react-redux';

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

                    <input type='text' name='prompt' id='prompt-input' className='form-control mb-1' onChange={(e) => this.setState({input: e.target.value})} autoFocus='on' />

                    <div className='text-right'>
                        <button className='btn btn-primary mr-1' onClick={() => this.props.dispatch(PromptSubmit(this.state.input, this.props.data))}>Submit</button>
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