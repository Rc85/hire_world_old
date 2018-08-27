import React, { Component } from 'react';
import TabBar from '../utils/TabBar';
import Response from '../pages/Response';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import '../../styles/admin/Admin.css'

class Admin extends Component {
    render() {
        if (this.props.user && this.props.user.user_level > 6) {
            return(
                <section id='admin' className='main-panel w-100'>
                    <TabBar items={[
                        {name: 'Overview', active: this.props.location.pathname === '/admin/overview' ? true : false, link: '/admin/overview'},
                        {name: 'Sectors', active: this.props.location.pathname === '/admin/sectors' ? true : false, link: '/admin/sectors'}
                    ]} />

                    {this.props.child}
                </section>
            )
        } else {
            return(
                <Response code={403} header={'Unauthorized Access'} message={`You're not authorized to access this page.`} />
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Admin));