import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import { UploadProfilePic, DeleteProfilePic } from '../../../actions/FileUploadActions';
import { connect } from 'react-redux';
import Loading from '../../utils/Loading';
import Alert from '../../utils/Alert';
import { ShowConfirmation } from '../../../actions/ConfirmationActions';
import { Button } from 'reactstrap';

class UserProfilePic extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data && nextProps.data.action === 'delete profile picture') {
            if (this.props.delete !== nextProps.delete && nextProps.delete) {
                this.props.dispatch(DeleteProfilePic());
            }
        }
    }

    onDrop(accepted) {
        let data = new FormData();
        data.set('profile_pic', accepted[0]);

        this.props.dispatch(UploadProfilePic(data));
    }

    deleteProfilePic() {
        this.props.dispatch(ShowConfirmation('Are you sure you want to delete your profile picture?', {action: 'delete profile picture'}));
    }

    render() {
        let dropzone, dropzoneRef, button ,deleteButton;
        let loadingCheck = /loading$/;
        let errorCheck = /error$/;
        let failCheck = /fail$/;
        let loading = <Loading size='3x' />

        if (this.props.editable) {
            dropzone = <div className='dropzone'><Dropzone ref={(node) => { dropzoneRef = node; }} onDrop={this.onDrop.bind(this)} style={{height: '100%', width: '100%'}} name='profile_pic' /></div>;
            button = <Button color='info' className='mr-1' id='add-profile-pic-button' onClick={() => { dropzoneRef.open() }}><FontAwesomeIcon icon={faPlus} /></Button>
            deleteButton = <Button color='info' id='delete-profile-pic-button' onClick={this.deleteProfilePic.bind(this)}><FontAwesomeIcon icon={faTimes} /></Button>
        }

        return(
            <div id='profile-pic' style={{background: `url(${this.props.user.avatar_url}) center top / cover`}}>
                {loadingCheck.test(this.props.status) ? loading : ''}
                {errorCheck.test(this.props.status) || failCheck.test(this.props.status) ? <Alert status='error' left={'10px'} top={'10px'} /> : ''}
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
        status: state.Upload.status,
        delete: state.Confirmation.option,
        data: state.Confirmation.data
    }
}

export default connect(mapStateToProps)(UserProfilePic);