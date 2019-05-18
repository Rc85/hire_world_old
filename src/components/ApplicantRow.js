import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserProfilePic from './UserProfilePic';
import moment from 'moment';
import Username from './Username';
import { connect } from 'react-redux';

class ApplicantRow extends Component {
    render() {
        return (
            <div className='applicant-row'>
                <div className='w-5'><UserProfilePic url={this.props.applicant.avatar_url} /></div>

                <div className='applicant-details'>
                    <Username username={this.props.applicant.applicant} color='alt-highlight' />
                    <div className='mb-1'><small><strong>Applied on {moment(this.props.applicant.applied_date).format('MM-DD-YYYY')}</strong></small></div>
                    <div className='keep-format'>{this.props.applicant.application_details}</div>
                </div>
            </div>
        );
    }
}

ApplicantRow.propTypes = {

};

const mapStateToProps = state => {
    return {
        confirm: state.Confirmation
    }
}

export default connect(mapStateToProps)(ApplicantRow);