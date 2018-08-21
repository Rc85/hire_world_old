import React, { Component } from 'react';
import '../styles/UserProfilePic.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import { UploadProfilePic, DeleteProfilePic } from '../actions/FileUploadActions';
import { connect } from 'react-redux';
import Loading from './Loading';
import Alert from './Alert';

class UserProfilePic extends Component {
    constructor(props) {
        super(props);
    }

    onDrop(accepted) {
        let data = new FormData();
        data.set('profile_pic', accepted[0]);

        this.props.dispatch(UploadProfilePic(data));
    }

    deleteProfilePic() {
        console.log('here');
        this.props.dispatch(DeleteProfilePic());
    }

    render() {
        let dropzone;
        let dropzoneRef;
        let button;
        let deleteButton;
        let loadingCheck = /loading$/;
        let errorCheck = /error$/;
        let failCheck = /fail$/;
        let loading = <Loading size='3x' />

        if (this.props.editable) {
            dropzone = <div className='dropzone'><Dropzone ref={(node) => { dropzoneRef = node; }} onDrop={this.onDrop.bind(this)} style={{height: '100%', width: '100%'}} name='profile_pic' /></div>;
            button = <button className='btn btn-info mr-2' id='add-profile-pic-button' onClick={() => { dropzoneRef.open() }}><FontAwesomeIcon icon={faPlus} /></button>
            deleteButton = <button className='btn btn-info' id='delete-profile-pic-button' onClick={this.deleteProfilePic.bind(this)}><FontAwesomeIcon icon={faTimes} /></button>
        }

        return(
            <div id='profile-pic' style={{background: `url(${this.props.user.avatar_url}) center top / cover`}}>
                {loadingCheck.test(this.props.status) ? loading : ''}
                {errorCheck.test(this.props.status) || failCheck.test(this.props.status) ? <Alert status={this.props.status} left={'10px'} top={'10px'} /> : ''}
                {dropzone}

                <div className='profile-pic-buttons'>
                    {button}
                    {deleteButton}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user,
        status: state.Upload.status
    }
}

export default connect(mapStateToProps)(UserProfilePic);