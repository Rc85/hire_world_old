import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SubmitButton from '../../utils/SubmitButton';
import { connect } from 'react-redux';
import InputWrapper from '../../utils/InputWrapper';
import TextArea from '../../utils/TextArea';
import { IsTyping } from '../../../actions/ConfigActions';

class MessageSender extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            subject: '',
            message: ''
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.status !== prevProps.status && this.props.status === 'send success') {
            this.setState({status: '', subject: '', message: ''});
        }
    }
    
    render() {
        return (
            <div id={this.props.id ? this.props.id : ''} className={`mb-3 ${this.props.className ? this.props.className : ''}`}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    this.props.send(this.state.message, this.state.verified, this.state.subject);
                }}>
                    {this.props.withSubject ? <div className='mb-1'>
                        <InputWrapper label='Subject' disabled={this.props.subject ? true : false}>
                            <input type='text' className='message-subject' disabled={this.props.subject ? true : false} value={this.props.subject ? `RE: ${this.props.subject}` : this.state.subject} onChange={(e) => this.setState({subject: e.target.value})} onFocus={() => this.props.dispatch(IsTyping(true))} onBlur={() => this.props.dispatch(IsTyping(false))} />
                        </InputWrapper>
                    </div> : ''}
    
                    <div className='mb-1'>
                        <TextArea rows={10} className='w-100 mb-1' textAreaClassName='w-100' value={this.state.message} onChange={(val) => this.setState({message: val})} autoFocus={this.props.autoFocus} placeholder={this.props.placeholder} />
                    </div>

                    <div className='text-right'>
                        <SubmitButton type='submit' value='Send' loading={this.props.status === 'Sending'} disabled={this.props.status === 'send success'} />
                        {this.props.cancel ? <button className='message-cancel-button btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button> : ''}
                        <button className='btn btn-secondary' onClick={() => this.setState({subject: '', message: ''})}>Clear</button>
                    </div>
                </form>
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