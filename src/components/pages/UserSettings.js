import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import LocationSettings from '../includes/page/LocationSettings';
import ProfileSettings from '../includes/page/ProfileSettings';
import EmailSettings from '../includes/page/EmailSettings';
import PasswordSettings from '../includes/page/PasswordSettings';
import ContactSettings from '../includes/page/ContactSettings';
import { ResetLoginStatus } from '../../actions/LoginActions';
import PropTypes from 'prop-types';

class UserSettings extends Component {
    componentWillUnmount() {
        this.props.dispatch(ResetLoginStatus(this.props.user.user));
    }

    render() {
        return(
            <div className='blue-panel shallow three-rounded'>
                <LocationSettings user={this.props.user} />

                <hr/>

                <div className='d-flex justify-content-between mb-3'>
                    <ProfileSettings user={this.props.user} />

                    <ContactSettings user={this.props.user} />
                </div>

                <hr/>

                <div className='d-flex justify-content-between mb-3'>
                    <PasswordSettings />

                    <EmailSettings user={this.props.user} />
                </div>
            </div>
        )
    }
}

UserSettings.propTypes = {
    user: PropTypes.object.isRequired
}

export default withRouter(connect()(UserSettings));