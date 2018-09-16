import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from '../../utils/Alert';
import SubmitButton from '../../utils/SubmitButton';

export default class MessageSender extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            message: '',
            status: '',
            statusMessage: ''
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.status === 'send error') {
            this.setState({status: nextProps.status, statusMessage: nextProps.statusMessage});
        }
    }
    
    render() {
        let status;

        if (this.state.status === 'send error') {
            let message = this.state.status.split(' ');

            status = <Alert status={message[1]} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        return (
            <div className='mb-3'>
                {status}
                <div className='mb-3'>
                    <div><label>Subject:</label></div>
                    <input type='text' name='subject' className='form-control' onChange={(e) => this.setState({subject: e.target.value})} defaultValue={this.props.subject ? `RE: ${this.props.subject}` : ''} disabled={this.props.subject ? true : false} />
                </div>

                <div className='mb-3'><textarea name='message' rows='10' className='form-control w-100 mb-1' onChange={(e) => this.setState({message: e.target.value})}></textarea></div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Send' loading={this.state.status === 'Sending' ? true : false} onClick={() => this.props.send(this.state.message)} />
                    <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                </div>
            </div>
        );
    }
}

MessageSender.propTypes = {
    send: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    status: PropTypes.string,
    statusMessage: PropTypes.string,
    subject: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ])
}