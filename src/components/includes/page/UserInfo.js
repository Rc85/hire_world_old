import React, { Component } from 'react';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { EditUser } from '../../../actions/EditUserActions';
import Loading from '../../utils/Loading';
import PropTypes from 'prop-types';

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
        let status, button;
        let value = this.props.value;
        let success = /success$/;
        let loading = /loading$/;

        if (this.state.editing) {
            button = <button className='btn btn-info btn-sm ml-auto' onClick={() => this.setState({editing: false})}><FontAwesomeIcon icon={faTimes}  /></button>;
            value = <input className='form-control' type='text' name={this.props.type}
            onKeyDown={(e) => {
                if (e.keyCode === 13) {
                    this.submitValue(this.state.input);
                    this.setState({editing: false});
                }
            }}
            onChange={(e) => this.setState({input: e.target.value})} />;
        } else {
            button = <button className='btn btn-info btn-sm ml-auto' onClick={() => this.setState({editing: true})}><FontAwesomeIcon icon={faEdit} /></button>;

            if (loading.test(this.props.status)) {
                status = <Loading size='1x' />;
            } else if (success.test(this.props.status)) {
                value = this.props.value;
            }
        }

        return(
            <div className='user-info mb-2'>
                {status}
                <div className='d-flex'>
                    <h5>{this.props.label}</h5>

                    {button}
                </div>

                <div className='ml-3 mt-3 text-truncate'>
                    {value}
                </div>
            </div>
        )
    }
}

UserInfo.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    type: PropTypes.string.isRequired,
    status: PropTypes.string
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default connect(mapStateToProps)(UserInfo);