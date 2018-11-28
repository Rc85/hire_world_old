import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TabBar from '../utils/TabBar';
import Response from './Response';
import Loading from '../utils/Loading';

const MessageDashboard = props => {
    if (props.user.status === 'getting session') {
        return <Loading size='7x' />;
    } else if (props.user.status === 'get session fail') {
        return <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />;
    } else if (props.user.status === 'access error' || props.user.status === 'error') {
        return <Response code={403} header='Unpermitted Access' message={props.user.statusMessage} />;
    } else if (props.user.status === 'inactive error') {
        let message = <span>
            <p>{this.props.user.statusMessage}</p>
            <p><a href='/resend-confirmation'>Resend Confirmation Email</a></p>
        </span>;

        return <Response code={401} header='Forbidden' message={message} />;
    } else if (props.user.status === 'get session success') {
        return(
            <section id='message-dashboard' className='main-panel w-100'>
                <TabBar items={[
                    {name: 'Inquiries', active: /^\/(messages\/Inquiries|message\/Inquire).*/.test(props.location.pathname) ? true : false, link: '/messages/Inquiries'},
                    {name: 'Active', active: /^\/(message|jobs)\/Active.*/.test(props.location.pathname) ? true : false, link: '/jobs/Active'},
                    {name: 'Completed', active: /^\/(message|jobs)\/Completed.*/.test(props.location.pathname) ? true : false, link: '/jobs/Completed'},
                    {name: 'Abandoned', active: /^\/(message|jobs)\/Abandoned.*/.test(props.location.pathname) ? true : false, link: '/jobs/Abandoned'},
                    {name: 'Appealing', active: /^\/(message|jobs)\/Appealing.*/.test(props.location.pathname) ? true : false, link: '/jobs/Appealing'}
                ]} />
    
                {props.children}
            </section>
        )
    }

    return <div></div>;
}

export default withRouter(connect()(MessageDashboard));