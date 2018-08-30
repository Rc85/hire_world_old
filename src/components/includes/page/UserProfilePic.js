import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import { GetSession } from '../../../actions/FetchActions';
import { connect } from 'react-redux';
import Loading from '../../utils/Loading';
import Alert from '../../utils/Alert';
import { ShowConfirmation } from '../../../actions/ConfirmationActions';
import fetch from 'axios';
import PropTypes from 'prop-types';

class UserProfilePic extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            statusMessage: ''
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.action === 'delete profile picture') {
            if (this.props.delete !== nextProps.delete && nextProps.delete) {
                this.deleteProfilePic();
            }
        }
    }

    onDrop(accepted) {
        let data = new FormData();
        data.set('profile_pic', accepted[0]);

        this.setState({status: 'Uploading'});

        fetch.post('/api/user/profile-pic/upload', data)
        .then(resp => {
            this.setState({status: resp.data.status, statusMessage: resp.data.statusMessage});

            this.props.dispatch(GetSession());
        })
        .catch(err => console.log(err));
    }

    confirmDelete() {
        this.props.dispatch(ShowConfirmation('Are you sure you want to delete your profile picture?', false, {action: 'delete profile picture'}));
        document.body.style.overflowY = 'hidden';
    }

    deleteProfilePic() {
        this.setState({status: 'Deleting'});

        fetch.post('/api/user/profile-pic/delete')
        .then(resp => {
            this.setState({status: resp.data.status});

            this.props.dispatch(GetSession());
        })
        .catch(err => console.log(err));
    }

    render() {
        let dropzoneRef, loading, dropzone, button, deleteButton;

        if (this.props.editable) {
            dropzone = <div className='dropzone'><Dropzone ref={(node) => { dropzoneRef = node; }} onDrop={this.onDrop.bind(this)} style={{height: '100%', width: '100%'}} name='profile_pic' /></div>;
            button = <button className='btn btn-info mr-1' id='add-profile-pic-button' onClick={() => { dropzoneRef.open() }}><FontAwesomeIcon icon={faPlus} /></button>;
            deleteButton = <button className='btn btn-info' id='delete-profile-pic-button' onClick={this.confirmDelete.bind(this)}><FontAwesomeIcon icon={faTimes} /></button>;
        }

        switch(this.state.status) {
            case 'Uploading':
            case 'Deleting':
                loading = <Loading size='3x' />; break;
            case 'An error occurred':
            case 'Delete failed':
            case 'Upload failed':
                loading = <Alert error='error' message={this.state.status} />; break;
        }

        return(
            <div className='profile-pic' style={{background: `url(${this.props.url}) center top / cover`}}>
                {loading}
                {dropzone}

                <div className='profile-pic-buttons'>
                    {button}
                    {deleteButton}
                </div>
            </div>
        )
    }
}

UserProfilePic.propTypes = {
    url: PropTypes.string.isRequired,
    editable: PropTypes.bool
}

const mapStateToProps = state => {
    return {
        user: state.Login.user,
        delete: state.Confirmation.option,
        data: state.Confirmation.data
    }
}

export default connect(mapStateToProps)(UserProfilePic);