import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../styles/Dashboard.css';
import Response from './Response';
import EditUser from './EditUser';

class Dashboard extends Component {
    render() {
        let component;

        if (this.props.user) {
            component = <section id='dashboard' className='main-panel'>
                <section className='tab-bar'>
                    <div className='tab-button active'>Edit</div>
                    <div className='tab-button'>My Listings</div>
                    <div className='tab-button'>Offers</div>
                    <div className='tab-button'>Accepted</div>
                    <div className='tab-button'>Settings</div>
                </section>

                <EditUser />
            </section>;
        } else {
            component = <Response code={401} header='Unauthorized Access' message={`You're not logged in`} />;
        }
        
        return(
            <div>{component}</div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));