import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import LocationSettings from '../includes/page/LocationSettings';
import ProfileSettings from '../includes/page/ProfileSettings';
import EmailSettings from '../includes/page/EmailSettings';
import PasswordSettings from '../includes/page/PasswordSettings';
import { ResetLoginStatus } from '../../actions/LoginActions';

class UserSettings extends Component {
    componentWillUnmount() {
        this.props.dispatch(ResetLoginStatus(this.props.user));
    }

    render() {
        return(
            <div className='blue-panel shallow three-rounded'>
                <LocationSettings />

                <hr/>

                <div className='d-flex justify-content-between mb-3'>
                    <ProfileSettings />

                    <PasswordSettings />

                    <EmailSettings />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(UserSettings));