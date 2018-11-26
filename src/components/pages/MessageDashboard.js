import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TabBar from '../utils/TabBar';

const MessageDashboard = props => {
    return(
        <section id='message-dashboard' className='main-panel w-100'>
            <TabBar items={[
                {name: 'Inquiries', active: /^\/message(s)?\/Inquiries.*/.test(props.location.pathname) ? true : false, link: '/messages/Inquiries'},
                {name: 'Active', active: /^\/(message|jobs)\/Active.*/.test(props.location.pathname) ? true : false, link: '/jobs/Active'},
                {name: 'Completed', active: /^\/(message|jobs)\/Completed.*/.test(props.location.pathname) ? true : false, link: '/jobs/Completed'},
                {name: 'Abandoned', active: /^\/(message|jobs)\/Abandoned.*/.test(props.location.pathname) ? true : false, link: '/jobs/Abandoned'},
            ]} />

            {props.children}
        </section>
    )
}

MessageDashboard.propTypes = {
    
};

export default withRouter(connect()(MessageDashboard));