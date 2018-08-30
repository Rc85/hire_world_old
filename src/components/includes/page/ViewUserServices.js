import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ViewUserService from './ViewUserService';

const ViewUserServices = services => {
    let userServices = services.services.map((service, i) => {
        return <ViewUserService key={i} service={service} />
    });

    return(
        <div id='view-user-services'>
            {userServices}
        </div>
    )
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