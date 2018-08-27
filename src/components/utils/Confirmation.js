import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HideConfirmation } from '../../actions/ConfirmationActions';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

class Confirmation extends Component {
    componentDidMount() {
        let modal = document.getElementById('confirmation-modal');
        modal.style.top = `${window.pageYOffset}px`;
    }

    confirmation(bool) {
        this.props.dispatch(HideConfirmation(bool, this.props.data));
        document.body.style.overflowY = 'auto';
    }

    render() {
        return(
            <div id='confirmation-modal'>
                <div className='confirmation-dialog rounded'>
                    <div className='confirmation-message mb-3'>
                        {this.props.message}
                        <div><small>{this.props.note}</small></div>
                    </div>

                    <div className='text-right'>
                        <Button color='primary' className='mr-1' onClick={() => {this.confirmation(true)}}>Yes</Button>
                        <Button color='secondary' onClick={() => {this.confirmation(false)}}>No</Button>
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
    note: PropTypes.string
}

export default connect(mapStateToProps)(Confirmation);