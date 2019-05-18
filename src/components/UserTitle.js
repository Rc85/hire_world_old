import React, { Component } from 'react';
import fetch from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-solid-svg-icons';
import PropTypes from 'prop-types';
import { UpdateUser } from '../actions/LoginActions';
import { connect } from 'react-redux';
import { Alert } from '../actions/AlertActions';
import { LogError } from './utils/LogError';

class UserTitle extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            title: '',
            titles: [],
            searchedTitles: [],
            timeout: 0
        }
    }
    
    searchTitle(value) {
        if (value) {
            if (this.state.timeout) clearTimeout(this.state.timeout);

            this.setState({
                timeout: setTimeout(() => {
                    fetch.post('/api/user/search/titles', {value: value})
                    .then(resp => {
                        if (resp.data.status === 'success') {
                            this.setState({searchedTitles: resp.data.titles});
                        } else {
                            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                        }
                    })
                    .catch(err => LogError(err, '/api/user/search/titles')); 
                }, 250)
            });
        }
    }

    setTitle(e) {
        if (e.keyCode === 13) {
            fetch.post('/api/user/profile/update', {'value': e.target.value, column: 'user_title'})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.dispatch(UpdateUser(resp.data.user));

                    this.setState({editing: false, title: resp.data.user.user_title, titles: resp.data.titles});
                } else {
                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => LogError(err, '/api/user/profile/update'));
        }
    }
    
    render() {
        let value;

        if (this.props.user.user) {
            if (!this.state.editing) {
                value = this.props.user.user.user_title;
            } else {
                value = <React.Fragment>
                    <input type='text' name='title' id='user-title' list='title-list' onChange={(e) => this.setState({title: e.target.value})} onKeyUp={(e) => this.searchTitle(e.target.value)} autoComplete='off' onKeyDown={(e) => this.setTitle(e)} />
                    <datalist id='title-list'>
                        {this.state.searchedTitles.map((title, i) => {
                            return <option key={i} value={title}>{title}</option>
                        })}
                    </datalist>
                </React.Fragment>
            }
        }

        return (
            <div className='user-info mb-2'>
                <div className='d-flex'>
                    <h5>Title</h5>

                    <button className='btn btn-info btn-sm ml-auto' onClick={() => this.setState({editing: !this.state.editing})}><FontAwesomeIcon icon={faEdit} /></button>
                </div>

                <div className='ml-3 mt-3 text-truncate'>
                    {value}
                </div>
            </div>
        );
    }
}

UserTitle.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect()(UserTitle);