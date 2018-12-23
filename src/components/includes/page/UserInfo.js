import React, { Component } from 'react';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import Loading from '../../utils/Loading';
import PropTypes from 'prop-types';
import fetch from'axios';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import { UncontrolledTooltip } from 'reactstrap';

class UserInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            input: null,
            editing: false,
            value: this.props.value
        }     
    }

    submitValue(value) {
        this.setState({status: 'Loading'});

        fetch.post('/api/user/edit', {column: this.props.label, value: value})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', editing: false, value: value});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/user/edit'));
    }

    render() {
        let status, button, value;

        if (this.state.status === 'Loading') {
            status = <Loading size='2x' />;
        }

        if (this.state.editing) {
            button = <button className='btn btn-info btn-sm ml-auto' onClick={() => this.setState({editing: false})}><FontAwesomeIcon icon={faTimes}  /></button>;
            value = <React.Fragment>
                <input id={`${this.props.label}-input`} className='form-control' type='text' name={this.props.type}
                onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                        this.submitValue(e.target.value);
                        this.setState({editing: false});
                    } else if (e.keyCode === 27) {
                        this.setState({editing: false});
                    }
                }} />
                <UncontrolledTooltip placement='top' target={`${this.props.label}-input`} trigger='focus'>Press enter to submit, escape to cancel</UncontrolledTooltip>
            </React.Fragment>;
        } else {
            button = <button className='btn btn-info btn-sm ml-auto' onClick={() => this.setState({editing: true})}><FontAwesomeIcon icon={faEdit} /></button>;
            value = this.state.value;
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
    status: PropTypes.string
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default connect(mapStateToProps)(UserInfo);