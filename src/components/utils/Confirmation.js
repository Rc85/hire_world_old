import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HideConfirmation } from '../../actions/ConfirmationActions';
import PropTypes from 'prop-types';

class Confirmation extends Component {
    componentDidMount() {
        let modal = document.getElementById('confirmation-modal');
        modal.style.top = `${window.pageYOffset}px`;
        document.body.style.overflowY = 'hidden';
    }

    confirmation(bool) {
        this.props.dispatch(HideConfirmation(bool, this.props.data));
        document.body.style.overflowY = 'auto';
    }

    render() {
        return(
            <div id='confirmation-modal' className='full-black-overlay'>
                <div className='modal-container rounded'>
                    <div className='modal-text mb-3'>
                        {this.props.message}
                        {this.props.note ? <div><small>{this.props.note}</small></div> : ''}
                    </div>

                    <div className='text-right'>
                        <button className='btn btn-primary mr-1' onClick={() => {this.confirmation(true)}}>Yes</button>
                        <button className='btn btn-secondary' onClick={() => {this.confirmation(false)}}>No</button>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        data: state.Confirmation.data
    }
}

Confirmation.propTypes = {
    message: PropTypes.string.isRequired,
    note: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.object
    ])
}

export default connect(mapStateToProps)(Confirmation);