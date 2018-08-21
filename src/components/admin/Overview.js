import React, { Component } from 'react';
import TabBar from './TabBar';
import Response from '../Response';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Overview extends Component {
    render() {
        if (this.props.user && this.props.user.user_level > 6) {
            return(
                <section id='admin' className='main-panel w-100'>
                    <TabBar active='overview' />

                    <div className='blue-panel shallow three-rounded'>
                        <h2>Overview</h2>
                    </div>
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

export default withRouter(connect(mapStateToProps)(Overview));