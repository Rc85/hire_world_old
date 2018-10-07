import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ViewUserService from './ViewUserService';

const ViewUserServices = props => {
    let userServices = props.services.map((service, i) => {
        return <ViewUserService key={i} user={props.user} service={service} />
    });

    if (userServices.length > 0) {
        return(
            <div id='view-user-services'>
                <h5>Listings</h5>

                {userServices}
            </div>
        )
    }

    return null;
}

ViewUserServices.propTypes = {
    services: PropTypes.array
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default connect(mapStateToProps)(ViewUserServices);