import React, { Component } from 'react';
import fetch from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { UpdateUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import Alert from '../../utils/Alert';

class UserTitle extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            title: this.props.user.user_title,
            titles: [],
            searchedTitles: []
        }
    }

    componentDidMount() {
        fetch.post('/api/get/titles')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({titles: resp.data.titles});
            }
        })
        .catch(err => console.log(err));
    }
    
    searchTitle(value) {
        let result = [];
    
        if (value) {
            let searchValue = new RegExp('\\b' + value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');

            for (let title of this.state.titles) {
                if (title.match(searchValue)) {
                    result.push(title);
                }
            }
        }

        this.setState({searchedTitles: result});
    }

    setTitle(e) {
        if (e.keyCode === 13) {
            fetch.post('/api/user/profile/update', {'value': e.target.value, column: 'user_title'})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.props.dispatch(UpdateUser(resp.data.user));

                    this.setState({editing: false, title: resp.data.user.user_title, titles: resp.data.titles});
                } else {
                    this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});
                }
            })
            .catch(err => console.log(err));
        }
    }
    
    render() {
        //console.log(this.state.titles);
        let status, value;

        if (!this.state.editing) {
            value = this.state.title;
        } else {
            value = <React.Fragment>
                <input type='text' name='title' id='user-title' className='form-control' list='title-list' onChange={(e) => this.setState({title: e.target.value})} onKeyUp={(e) => this.searchTitle(e.target.value)} autoComplete='off' onKeyDown={(e) => this.setTitle(e)} />
                <datalist id='title-list'>
                    {this.state.searchedTitles.map((title, i) => {
                        return <option key={i} value={title}>{title}</option>
                    })}
                </datalist>
            </React.Fragment>
        }

        if (this.state.status === 'error') {
            status = <Alert status={this.state.status} message={this.state.statusMessage} unmount={() => this.setState({status: '', statusMessage: ''})} />;
        }

        return (
            <div className='user-info mb-2'>
                {status}
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