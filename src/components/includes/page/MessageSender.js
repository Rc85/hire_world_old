import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '../../../actions/AlertActions';
import SubmitButton from '../../utils/SubmitButton';
import { connect } from 'react-redux';
import InputWrapper from '../../utils/InputWrapper';
import TextArea from '../../utils/TextArea';
import { isTyping } from '../../../actions/ConfigActions';

class MessageSender extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            subject: this.props.subject ? `RE: ${this.props.subject}` : '',
            message: '',
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.status !== prevProps.status && this.props.status === 'send success') {
            this.setState({status: '', subject: '', message: ''});
        }
    }

    send() {
        this.props.send(this.state.message, this.state.subject);
        this.setState({subject: '', message: ''});
    }
    
    render() {
        return (
            <div className={`mb-3 ${this.props.className ? this.props.className : ''}`}>
                <div className='mb-1'>
                    <InputWrapper label='Subject'>
                        <input type='text' className='message-subject' disabled={this.props.subject ? true : false} value={this.state.subject} onChange={(e) => this.setState({subject: e.target.value})} />
                    </InputWrapper>
                    {/* <div><label>Subject:</label></div>
                    <input type='text' name='subject' onChange={(e) => this.setState({subject: e.target.value})} value={this.state.subject} disabled={this.props.subject ? true : false} /> */}
                </div>

                <div className='mb-1'>
                    <TextArea rows={10} className='w-100 mb-1' textAreaClassName='w-100' value={this.state.message} onChange={(val) => this.setState({message: val})} autoFocus={this.props.autoFocus} />
                
                    {/* <textarea name='message' rows='10'className='w-100 mb-1' value={this.state.message} onChange={(e) => this.setState({message: e.target.value})} autoFocus={this.props.autoFocus} onFocus={() => this.props.dispatch(isTyping(true))} onBlur={() => this.props.dispatch(isTyping(false))}></textarea> */}
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Send' loading={this.props.status ? true : false} onClick={() => this.send()} />
                    {this.props.cancel ? <button className='message-cancel-button btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button> : <button className='btn btn-secondary' onClick={() => this.setState({subject: '', message: ''})}>Clear</button>}
                </div>
            </div>
        );
    }
}

MessageSender.propTypes = {
    send: PropTypes.func.isRequired,
    cancel: PropTypes.func,
    status: PropTypes.string,
    subject: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ])
}

export default connect()(MessageSender);