import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NotConnected from '../includes/page/NotConnected';
import { withRouter } from 'react-router-dom';

class Jobs extends Component {
    render() {
        if (this.props.user.user) {
            if (!this.props.user.user.connected_id) {
                return <NotConnected user={this.props.user} />;
            } else if (!this.props.match.params.stage) {
                return(
                    <span>You're connected</span>
                )
            }
        }

        return null;
    }
}

Jobs.propTypes = {

};

export default withRouter(Jobs);