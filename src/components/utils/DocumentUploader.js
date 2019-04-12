import React, { Component } from 'react';
import PropTypes from 'prop-types';

class DocumentUploader extends Component {
    render() {
        return (
            <div className='document-uploader'>
                <input type='file' onChange={(e) => this.props.upload(e.target.files)} />
            </div>
        );
    }
}

DocumentUploader.propTypes = {

};

export default DocumentUploader;