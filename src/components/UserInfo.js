import React, { Component } from 'react';
import '../styles/UserInfo.css';
import { faEdit, faTimes, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { EditUser } from '../actions/EditUserActions';

class UserInfo extends Component {
    constructor(props) {
        super(props);

        this.submitValue = this.submitValue.bind(this);

        this.state = {
            input: null,
            editing: false
        }     
    }

    submitValue(value) {
        this.props.dispatch(EditUser(this.props.type, value, this.props.user));
    }

    render() {
        let button;
        let value = this.props.value;
        let success = /success$/;
        let loading = /loading$/;
        let error = /(error|fail)$/;

        if (this.state.editing) {
            button = <button className='btn btn-info btn-sm ml-auto'><FontAwesomeIcon icon={faTimes} onClick={() => {
                this.setState({
                    editing: false
                });
            }} /></button>;
            value = <form id='edit-user-form' action='/api/edit/user' method='post' onSubmit={(e) => {
                e.preventDefault();
                
                this.submitValue(this.state.input);

                this.setState({
                    editing: false
                });
            }}>
                <input className='form-control' type='text' name={this.props.type}
                onKeyDown={(e) => {
                    if (e.keycode === 13) {
                        document.getElementById('edit-user-form').submit();
                    }
                }}
                onChange={(e) => {
                    this.setState({
                        input: e.target.value
                    })
                }} />
            </form>;
        } else {
            button = <button className='btn btn-info btn-sm ml-auto'><FontAwesomeIcon icon={faEdit} onClick={() => {
                this.setState({
                    editing: true
                });
            }} /></button>;
            if (loading.test(this.props.status)) {
                value = <span><FontAwesomeIcon icon={faCircleNotch} spin /></span>;
            } else if (error.test(this.props.status)) {
                value = <span class='edit-user-error'><FontAwesome icon={faTimes} /> Error</span>;
            } else if (success.test(this.props.status)) {
                value = this.props.value;
            }
        }

        return(
            <div className='user-info mb-2'>
                <div className='d-flex'>
                    <h6>{this.props.label}</h6>

                    {button}
                </div>

                <div className='ml-3 mt-3'>
                    {value}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(UserInfo));