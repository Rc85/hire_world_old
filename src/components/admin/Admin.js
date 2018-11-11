import React, { Component } from 'react';
import TabBar from '../utils/TabBar';
import Response from '../pages/Response';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'Loading',
            statusMessage: ''
        }
    }
    
    componentDidMount() {
        fetch.get('/api/admin/privilege')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', authorized: true});
            } else if (resp.data.status === 'error') {
                this.setState({status: '', statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => console.log(err));
    }
    
    render() {
        if (this.state.status === 'Loading') {
            return <Loading size='7x' />;
        } else if (this.state.status === 'error') {
            return <Reponse code={500} header={'Internal Server Error'} message={this.state.statusMessage} />;
        } else {
            if (!this.state.authorized) {
                return <Response code={403} header={'Unauthorized Access'} message={this.state.statusMessage} />;
            }

            return(
                <section id='admin' className='main-panel w-100'>
                    <TabBar items={[
                        {name: 'Overview', active: this.props.location.pathname === '/admin-panel' ? true : false, link: '/admin-panel'},
                        {name: 'Sectors', active: this.props.location.pathname === '/admin-panel/sectors' ? true : false, link: '/admin-panel/sectors'},
                        {name: 'Users', active: this.props.location.pathname === '/admin-panel/users' ? true : false, link: '/admin-panel/users'},
                        {name: 'Listings', active: this.props.location.pathname === '/admin-panel/listings' ? true : false, link: '/admin-panel/listings'},
                        {name: 'Reports', active: this.props.location.pathname === '/admin-panel/reports' ? true : false, link: '/admin-panel/reports'},
                        {name: 'Site Config', active: this.props.location.pathname === '/admin-panel/config' ? true : false, link: '/admin-panel/config'},
                        {name: 'Error Log', active: this.props.location.pathname === '/admin-panel/error' ? true : false, link: '/admin-panel/error'},
                    ]} />

                    {this.props.children}
                </section>
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