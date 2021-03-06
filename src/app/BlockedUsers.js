import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/pro-regular-svg-icons';
import TitledContainer from '../components/utils/TitledContainer';
import AlphaNumericFilter from '../components/utils/AlphaNumericFilter';
import { LogError } from '../components/utils/LogError';
import fetch from 'axios';
import Username from '../components/Username';
import { faUserSlash, faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
import Loading from '../components/utils/Loading';
import { connect } from 'react-redux';
import { Alert } from '../actions/AlertActions';
import { Redirect } from 'react-router-dom';

class BlockedUsers extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            filtering: 'All',
            users: []
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset || prevState.filtering !== this.state.filtering) {
            this.setState({status: 'Fetching'});

            fetch.post('/api/get/user/blocked', {letter: this.state.filtering, offset: this.state.offset})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', users: resp.data.users});
                } else if (resp.data.status === 'error') {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => {
                LogError(err, '/api/get/user/blocked');
                this.setState({status: ''});
            });
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/get/user/blocked', {letter: this.state.filtering})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', users: resp.data.users});
            } else if (resp.data.status === 'error') {
                this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
            }
        })
        .catch(err => {
            LogError(err, '/api/get/user/blocked');
            this.setState({status: ''});
        });
    }

    unblockUser(username, index) {
        this.setState({status: 'Unblocking'});

        fetch.post('/api/user/block', {user: username, action: 'unblock'})
        .then(resp => {
            if (resp.data.status === 'success') {
                let users = [...this.state.users];
                users.splice(index, 1);

                this.setState({status: '', users: users});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => {
            LogError(err, '/api/user/unblock');
            this.setState({status: ''});
        });
    }

    render() {
        if (this.props.user.status === 'error') {
            return <Redirect to='/error/app/401' />;
        } else if (this.props.user.status === 'not logged in') {
            return <Redirect to='/main' />;
        } else if (this.state.status === 'Fetching') {
            return <Loading size='7x' color='black' />;
        }

        if (this.props.user.user) {
            let users = this.state.users.map((user, i) => {
                return <div key={i} className='user-container'>
                    <Username username={user.blocked_user} color='highlight' />
                    {this.state.status === 'Unblocking' ? <FontAwesomeIcon icon={faCircleNotch} spin className='text-dark' /> : <FontAwesomeIcon icon={faTimesCircle} className='unblock-button' onClick={() => this.unblockUser(user.blocked_user, i)} />}
                </div>
            });

            return (
                <section id='blocked-users' className='main-panel'>
                    <TitledContainer title='Blocked Users' icon={<FontAwesomeIcon icon={faUserSlash} />} bgColor='danger' shadow>
                        <div className='filter-container'>
                            <AlphaNumericFilter filter={(letter) => this.setState({filtering: letter})} currentLetter={this.state.filtering} />
                        </div>

                        <div className='blocked-user-container'>
                            {users}
                        </div>
                    </TitledContainer>
                </section>
            );
        }
        
        return <Loading size='7x' color='black' />;
    }
}

BlockedUsers.propTypes = {
    user: PropTypes.object
};

export default connect()(BlockedUsers);