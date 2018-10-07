import React, { Component } from 'react';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import Alert from '../../utils/Alert';
import { UpdateUser } from '../../../actions/LoginActions';
import PropTypes from 'prop-types';
import fetch from 'axios';

class ProfileSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            businessName: this.props.user.user.user_business_name || '',
            phone: this.props.user.user.user_phone || '',
            address: this.props.user.user.user_address || '',
            code: this.props.user.user.user_city_code || '',
            status: '',
            statusMessage: ''
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
            fetch.post('/api/user/settings/profile/save', this.state)
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.dispatch(UpdateUser(resp.data.user));
                }
                
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            });
        }
    }

    render() {
        console.log(this.props)
        let status;

        if (this.state.status === 'success' || this.state.status === 'error') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />
        } else if (this.state.status === 'Loading') {
            status = <Loading size='5x' />
        }

        return(
            <div id='profile-settings'>
                {status}
                <div className='d-flex-between-start'>
                    <div className='w-45 mb-3'>
                        <label htmlFor='business-name'>Business Name:</label>
                        <input type='text' name='business_name' id='business-name' className='form-control' defaultValue={this.state.businessName} onChange={(e) => this.setState({businessName: e.target.value})} maxLength='40' placeholder='Maximum 40 characters' />
                    </div>
    
                    <div className='w-45 mb-3'>
                        <label htmlFor='phone'>Phone Number:</label>
                        <input type='tel' name='phone' id='phone' className='form-control' onChange={(e) => this.setState({phone: e.target.value})} value={this.state.phone} />
                    </div>
                </div>

                <div className='d-flex-between-start'>
                    <div className='w-45 mb-3'>
                        <div className='d-flex-between-center'>
                            <label htmlFor='user-address'>Address:</label>
                        </div>
                        
                        <input type='text' name='address' id='user-address' className='form-control' onChange={(e) => this.setState({address: e.target.value})} defaultValue={this.state.address} />
                    </div>
                    
                    <div className='w-45 mb-3'>
                        <label htmlFor='postalzip'>Postal Code/Zip Code</label>
                        <input type='text' name='postalzip' id='postalzip' className='form-control' onChange={(e) => this.setState({code: e.target.value})} defaultValue={this.state.code} />
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={this.props.user.status === 'Loading'} onClick={() => this.save()} />
                </div>
            </div>
        )
    }
}

ProfileSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(ProfileSettings);