import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import Menu from '../../utils/Menu';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';

class AdminSectorRow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sector: this.props.sector || {
                sector_id: '',
                sector: '',
                sector_created_on: '',
                sector_created_by: '',
                sector_status: ''
            }
        }
    }

    toggleMenu() {
        if (this.props.menu.open !== 'admin') {
            this.props.dispatch(ToggleMenu('admin', '', this.state.sector.sector_id))
        } else {
            this.props.dispatch(ToggleMenu('', 'admin', this.state.sector.sector_id));
        }
    }

    handleMenuClick(val) {
        fetch.post('/api/admin/sector/change-status', {status: val, id: this.state.sector.sector_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(ToggleMenu('', 'admin', this.state.sector.sector_id));

                this.setState({sector: resp.data.sector});
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        if (this.state.sector) {  
            return (
                <div className='d-flex-center mb-3'>
                    <div className='w-5'>{this.state.sector.sector_id}</div>
                    <div className='w-35'>{this.state.sector.sector}</div>
                    <div className='w-25'>{this.state.sector.sector_created_on}</div>
                    <div className='w-20'>{this.state.sector.sector_created_by}</div>
                    <div className='w-10'>
                        <span className={this.state.sector.sector_status === 'Open' ? 'badge badge-success' : 'badge badge-danger'}>{this.state.sector.sector_status}</span>
                    </div>
                    <div className='w-5 position-relative text-right'>
                        <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}><FontAwesomeIcon icon={faCaretDown} /></button>
                        <Menu open={this.props.menu.open === 'admin' && this.props.menu.id === this.state.sector.sector_id} items={['Open', 'Close', 'Delete']} onClick={(val) => this.handleMenuClick(val)} />
                    </div>
                </div>
            )
        }

        return null;
    }
}

AdminSectorRow.propTypes = {
    sector: PropTypes.object
};

const mapStateToProps = state => {
    return {
        menu: state.Menu
    }
}

export default connect(mapStateToProps)(AdminSectorRow);