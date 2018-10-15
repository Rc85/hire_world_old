import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '../../../actions/AlertActions';
import SubmitButton from '../../utils/SubmitButton';
import { connect } from 'react-redux';

class MessageSender extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            subject: this.props.subject ? `RE: ${this.props.subject}` : '',
            message: '',
            status: this.props.status
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        if (nextProps.status === 'send success') {
            this.setState({message: '', subject: this.props.subject || ''});
        }
    }
    
    render() {
        return (
            <div className='mb-3'>
                <div className='mb-3'>
                    <div><label>Subject:</label></div>
                    <input type='text' name='subject' className='form-control' onChange={(e) => this.setState({subject: e.target.value})} value={this.state.subject} disabled={this.props.subject ? true : false} />
                </div>

                <div className='mb-3'><textarea name='message' rows='10' className='form-control w-100 mb-1' value={this.state.message} onChange={(e) => this.setState({message: e.target.value})} autoFocus={true}></textarea></div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Send' loading={this.state.status === 'Sending' ? true : false} onClick={() => this.props.send(this.state.message, this.state.subject)} />
                    {this.props.cancel ? <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button> : ''}
                </div>
            </div>
        );
    }
}

MessageSender.propTypes = {
    send: PropTypes.func.isRequired,
    cancel: PropTypes.func,
    status: PropTypes.string,
    statusMessage: PropTypes.string,
    subject: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ])
}

export default connect()(MessageSender);