import React, { Component } from 'react';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import { Alert } from '../../../actions/AlertActions';
import { UpdateUser } from '../../../actions/LoginActions';
import PropTypes from 'prop-types';
import fetch from 'axios';
import { ShowWarning } from '../../../actions/WarningActions';

class ProfileSettings extends Component {
    constructor(props) {
        super(props);

        this.initialSettings = {
            businessName: this.props.user.user.user_business_name || '',
            phone: this.props.user.user.user_phone || '',
            address: this.props.user.user.user_address || '',
            code: this.props.user.user.user_city_code || '',
        }

        this.state = {
            settings: this.initialSettings,
            status: '',
            statusMessage: ''
        }
    }

    save() {
        fetch.post('/api/user/settings/profile/save', this.state.settings)
        .then(resp => {
            if (resp.data.status === 'success') {
                console.log(resp.data.user)
                if (resp.data.user.hide_email && !resp.data.user.allow_messaging && !resp.data.user.user_phone) {
                    this.props.dispatch(ShowWarning(`You've hidden and disabled all forms of contact`));
                }

                this.initialSettings = {
                    businessName: resp.data.user.user_business_name,
                    phone: resp.data.user.user_phone,
                    address: resp.data.user.user_address,
                    code: resp.data.user.user_city_code
                }

                this.setState({settings: this.initialSettings});

                this.props.dispatch(UpdateUser(resp.data.user));
            }
            
            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        });
    }

    setSettings(obj) {
        let settings = Object.assign({}, this.state.settings, obj);
        this.setState({settings: settings});
    }

    render() {
        console.log(this.state);
        let status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        return(
            <div id='profile-settings'>
                {status}
                <div className='d-flex-between-start'>
                    <div className='w-45 mb-3'>
                        <label htmlFor='business-name'>Business Name:</label>
                        <input type='text' name='business_name' id='business-name' className='form-control' defaultValue={this.initialSettings.businessName} onChange={(e) => this.setSettings({businessName: e.target.value})} maxLength='40' placeholder='Maximum 40 characters' />
                    </div>
    
                    <div className='w-45 mb-3'>
                        <label htmlFor='phone'>Phone Number:</label>
                        <input type='tel' name='phone' id='phone' className='form-control' onChange={(e) => this.setSettings({phone: e.target.value})} defaultValue={this.initialSettings.phone} />
                    </div>
                </div>

                <div className='d-flex-between-start'>
                    <div className='w-45 mb-3'>
                        <div className='d-flex-between-center'>
                            <label htmlFor='user-address'>Address:</label>
                        </div>
                        
                        <input type='text' name='address' id='user-address' className='form-control' onChange={(e) => this.setSettings({address: e.target.value})} defaultValue={this.initialSettings.address} />
                    </div>
                    
                    <div className='w-45 mb-3'>
                        <label htmlFor='postalzip'>Postal Code/Zip Code:</label>
                        <input type='text' name='postalzip' id='postalzip' className='form-control' onChange={(e) => this.setSettings({code: e.target.value})} defaultValue={this.initialSettings.code} />
                    </div>
                </div>

                <div className='text-right'>
                    <SubmitButton type='button' value='Save' loading={this.props.user.status === 'Loading'} onClick={() => this.save()} disabled={JSON.stringify(this.state.settings) === JSON.stringify(this.initialSettings)} />
                </div>
            </div>
        )
    }
}

ProfileSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(ProfileSettings);