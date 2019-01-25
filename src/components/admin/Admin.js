import React, { Component } from 'react';
import TabBar from '../utils/TabBar';
import Response from '../pages/Response';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import fetch from 'axios';
import Loading from '../utils/Loading';
import { LogError } from '../utils/LogError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersCog, faExclamationTriangle, faCogs, faTable } from '@fortawesome/free-solid-svg-icons';
import { faListAlt } from '@fortawesome/free-regular-svg-icons';
import SideBar from '../includes/site/SideBar';
import BottomBar from '../includes/site/BottomBar';

class Admin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'Loading',
            statusMessage: ''
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            fetch.post('/api/admin/privilege')
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', authorized: true});
                } else if (resp.data.status === 'error') {
                    this.setState({status: '', statusMessage: resp.data.statusMessage});
                } else if (resp.data.status === 'access error') {
                    this.setState({status: '', authorized: false});
                }
            })
            .catch(err => LogError(err, '/api/auth/privilege'));
        }
    }

    componentDidMount() {
        fetch.post('/api/admin/privilege')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', authorized: true});
            } else if (resp.data.status === 'error') {
                this.setState({status: '', statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => LogError(err, '/api/auth/privilege'));
    }
    
    render() {
        if (this.state.status === 'Loading') {
            return <Loading size='7x' />;
        } else if (this.state.status === 'error') {
            return <Reponse code={500} header={'Internal Server Error'} message={this.state.statusMessage} />;
        }

        if (!this.state.authorized) {
            return <Response code={403} header={'Unauthorized Access'} message={this.state.statusMessage} />;
        }

        let items = [
            {name: 'Overview', link: '/admin-panel', active: /^\/admin-panel$/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faTable} />},
            {name: 'Users', link: '/admin-panel/users', active: /^\/admin-panel\/users/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faUsersCog} />},
            {name: 'Sectors', link: '/admin-panel/sectors', active: /^\/admin-panel\/sectors/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faListAlt} />},
            {name: 'Reports', link: '/admin-panel/reports', active: /^\/admin-panel\/reports/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faExclamationTriangle} />},
            {name: 'Site Configs', link: '/admin-panel/configs', active: /^\/admin-panel\/configs/.test(this.props.location.pathname), icon: <FontAwesomeIcon icon={faCogs} />}
        ];

        return(
            <section id='dashboard'>
                {!this.props.config.isMobile ? <SideBar user={this.props.user} items={items} /> : <BottomBar user={this.props.user} items={items} />}

                <div id='dashboard-main'>
                    {this.props.location.pathname.match(/^\/dashboard/) ? <div id='main-panel-bg'></div> : ''}
                    {this.props.children}
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login,
        config: state.Config
    }
}

export default withRouter(connect(mapStateToProps)(Admin));