import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretSquareDown, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Menu extends Component {
    toggleMenu() {
        let status;
        
        if (this.props.menu !== this.props.name || !this.props.status) {
            status = true;
        } else {
            status = false;
        }
    }

    render() {
        let icon;
        let show;

        if (this.props.menu === this.props.name && this.props.status) {
            icon = <FontAwesomeIcon icon={faMinusSquare} size='lg' className='menu-button' />;
            show = {display: 'block'}
        } else {
            icon = <FontAwesomeIcon icon={faCaretSquareDown} size='lg' className='menu-button' />;
            show = {display: 'none'}
        }

        return(
            <div className='w-5 menu-container'>
                <div onClick={this.toggleMenu.bind(this)}>{icon}</div>

                <div className='menu' style={show}>
                    <div className='menu-item'>Open</div>
                    <div className='menu-item'>Close</div>
                    <div className='menu-item'>Delete</div>
                </div>
            </div>
        )
    }
}

Menu.propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
}

export default withRouter(connect()(Menu));