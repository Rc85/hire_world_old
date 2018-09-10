import React, { Component } from 'react';
import { connect } from 'react-redux';
import SlideToggle from '../../utils/SlideToggle';
import SubmitButton from '../../utils/SubmitButton';
import Alert from '../../utils/Alert';
import { SaveProfile } from '../../../actions/SettingsActions';
import PropTypes from 'prop-types';

class ProfileSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            businessName: '',
            displayFullName: false,
            displayBusinessName: false,
            status: '',
            statusMessage: ''
        }
    }

    componentDidMount() {
        if (this.props.user) {
            this.setState({
                firstName: this.props.user.user.user_firstname,
                lastName: this.props.user.user.user_lastname,
                businessName: this.props.user.user.business_name,
                displayBusinessName: !this.props.user.user.display_business_name ? false : true,
                displayFullName: !this.props.user.user.display_fullname ? false : true
            });
        }
    }

    save() {
        let nameCheck = /^[a-zA-Z]*$/;
        let lengthCheck = /^.{40}$/

        if (!nameCheck.test(this.state.firstName) || !nameCheck.test(this.state.lastName)) {
            this.setState({status: 'error', statusMessage: 'Invalid name'});
        } else if (lengthCheck.test(this.state.businessName)) {
            this.setState({status: 'error', statusMessage: 'Business name is too long'});
        } else {
            this.props.dispatch(SaveProfile(this.state, this.props.user.user));
        }
    }

    render() {
        let error;

        if (this.state.status) {
            error = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        if (this.props.user.status === 'save profile success') {
            error = <Alert status='success' message='Profile settings saved' unmount={() => this.setState({status: '', statusMessage: ''})} />
        } else if (this.props.user.status === 'save profile error' || this.props.user.status === 'save profile fail') {
            error = <Alert status='error' message='An error occurred' unmount={() => this.setState({status: '', statusMessage: ''})} />
        }

        return(
            <div id='profile-settings' className='settings-col'>
                {error}
                <div className='mb-3'>
                    <label htmlFor='first-name'>First Name:</label>
                    <input type='text' name='first_name' id='first-name' className='form-control' defaultValue={this.state.firstName} onChange={(e) => {this.setState({firstName: e.target.value})}} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='last-name'>Last Name:</label>
                    <input type='text' name='last_name' id='last-name' className='form-control' defaultValue={this.state.lastName} onChange={(e) => this.setState({lastName: e.target.value})}/>
                </div>

                <div className='settings-row mb-3'>
                    <span>Display full name:</span>
                    <SlideToggle status={this.state.displayFullName ? 'Active' : 'Inactive'} onClick={() => this.setState({displayFullName: !this.state.displayFullName})} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='business-name'>Business Name:</label>
                    <input type='text' name='business_name' id='business-name' className='form-control' defaultValue={this.state.businessName} onChange={(e) => this.setState({businessName: e.target.value})} maxLength='40' placeholder='Maximum 40 characters' />
                </div>

                <div className='settings-row mb-3'>
                    <span>Display business name:</span>
                    <SlideToggle status={this.state.displayBusinessName ? 'Active' : 'Inactive'} onClick={() => this.setState({displayBusinessName: !this.state.displayBusinessName})} />
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={/loading$/.test(this.props.user.status)} onClick={() => this.save()} />
                </div>
            </div>
        )
    }
}

ProfileSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(ProfileSettings);