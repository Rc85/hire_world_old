import React, { Component } from 'react';
import TabBar from '../utils/TabBar';
import Response from '../pages/Response';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            statusMessage: ''
        }
    }
    
    componentDidMount() {
        fetch.get('/api/admin/privilege')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({authorized: true});
            } else {
                this.setState({statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }
    
    render() {
        if (this.state.authorized) {
            return(
                <section id='admin' className='main-panel w-100'>
                    <TabBar items={[
                        {name: 'Overview', active: this.props.location.pathname === '/admin-panel' ? true : false, link: '/admin-panel'},
                        {name: 'Sectors', active: this.props.location.pathname === '/admin-panel/sectors' ? true : false, link: '/admin-panel/sectors'},
                        {name: 'Users', active: this.props.location.pathname === '/admin-panel/users' ? true : false, link: '/admin-panel/users'},
                        {name: 'Listings', active: this.props.location.pathname === '/admin-panel/listings' ? true : false, link: '/admin-panel/listings'},
                        {name: 'Messages', active: this.props.location.pathname === '/admin-panel/messages' ? true : false, link: '/admin-panel/messages'},
                        {name: 'Reports', active: this.props.location.pathname === '/admin-panel/reports' ? true : false, link: '/admin-panel/reports'},
                        {name: 'Site Config', active: this.props.location.pathname === '/admin-panel/config' ? true : false, link: '/admin-panel/config'},
                        {name: 'Error Log', active: this.props.location.pathname === '/admin-panel/error' ? true : false, link: '/admin-panel/error'},
                    ]} />

                    {this.props.children}
                </section>
            )
        }

        return(
            <Response code={403} header={'Unauthorized Access'} message={this.state.statusMessage} />
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Admin));