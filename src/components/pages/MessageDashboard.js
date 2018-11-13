import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TabBar from '../utils/TabBar';

const MessageDashboard = props => {
    return(
        <section id='message-dashboard' className='main-panel w-100'>
            <TabBar items={[
                {name: 'Inquiries', active: /^\/message(s)?\/Inquire.*/.test(props.location.pathname) ? true : false, link: '/messages/Inquire'},
                {name: 'Active', active: /^\/message(s)?\/Active.*/.test(props.location.pathname) ? true : false, link: '/messages/Active'},
                {name: 'Completed', active: /^\/message(s)?\/Completed.*/.test(props.location.pathname) ? true : false, link: '/messages/Completed'},
                {name: 'Abandoned', active: /^\/message(s)?\/Abandoned.*/.test(props.location.pathname) ? true : false, link: '/messages/Abandoned'},
            ]} />

            {props.children}
        </section>
    )
}

MessageDashboard.propTypes = {
    
};

export default withRouter(connect()(MessageDashboard));