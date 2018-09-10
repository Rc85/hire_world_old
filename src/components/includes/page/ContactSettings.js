import React, { Component } from 'react';
import SlideToggle from '../../utils/SlideToggle';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import Alert from '../../utils/Alert';
import { SaveContact } from '../../../actions/SettingsActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { UncontrolledTooltip } from 'reactstrap';
import PropTypes from 'prop-types';

class ContactSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phone: '',
            address: '',
            display: false,
            status: '',
            statusMessage: ''
        }
    }

    componentDidMount() {
        if (this.props.user.user) {
            this.setState({
                phone: this.props.user.user.user_phone || '',
                address: this.props.user.user.user_address || '',
                display: this.props.user.user.display_contacts
            });
        }
    }

    save() {
        let telCheck = /^\+?\d?\s?\(?\d*\)?\s?(\d|-+){5,}(\d)$/;

        if (!telCheck.test(this.state.phone)) {
            this.setState({
                status: 'error',
                statusMessage: 'Invalid phone number'
            });
        } else {
            this.props.dispatch(SaveContact(this.state, this.props.user.user));
        }
    }

    render() {
        let error;

        if (this.state.status) {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        if (this.props.user) {
            switch(this.props.user.status) {
                case 'Invalid phone number': error = <Alert status='error' message={this.state.status} unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
                case 'save contact success': error = <Alert status='success' message='Contact saved' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
                case 'save contact error': error = <Alert status='error' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
                case 'save contact fail': error = <Alert status='error' message='Unable to save' unmount={() => this.setState({status: '', statusMessage: ''})} />; break;
            }
        }

        return (
            <div id='contact-settings' className='settings-col'>
                {error}
                <div className='d-flex justify-content-end'>
                    <div id='contact-tip' className='d-inline-flex'><FontAwesomeIcon icon={faQuestionCircle} size='1x' /></div>
                    <UncontrolledTooltip target='contact-tip' placement='top'>Consider using your business address and not your personal home address</UncontrolledTooltip>
                </div>

                <div className='mb-3'>
                    <label htmlFor='phone'>Phone Number:</label>
                    <input type='tel' name='phone' id='phone' className='form-control' onChange={(e) => this.setState({phone: e.target.value})} value={this.state.phone} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='user-address'>Address:</label>
                    <textarea name='address' id='user-address' rows='10' className='form-control w-100' onChange={(e) => this.setState({address: e.target.value})} value={this.state.address}></textarea>
                </div>

                <div className='settings-row mb-3'>
                    <span>Display contacts:</span>

                    <SlideToggle status={this.state.display ? 'Active' : 'Inactive'} onClick={() => {this.setState({display: !this.state.display})}} />
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={/loading$/.test(this.props.user.status) ? true : false} onClick={() => this.save()} />
                </div>
            </div>
        );
    }
}

ContactSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(ContactSettings);