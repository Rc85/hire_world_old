import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import Menu from '../../utils/Menu';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import moment from 'moment';
import { LogError } from '../../utils/LogError';

class AdminSectorRow extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sectorName: '',
            rename: '',
            sector: this.props.sector || {
                sector_id: '',
                sector: '',
                sector_created_on: '',
                sector_created_by: '',
                sector_status: ''
            }
        }
    }

    componentDidMount() {
        document.body.addEventListener('click', this.hideSectorNameInput = (e) => {
            if (!e.target.classList.contains('sector-name-input')) {
                this.setState({rename: false});
            }
        });
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.hideSectorNameInput);
    }

    toggleMenu() {
        if (this.props.menu.open !== 'admin') {
            this.props.dispatch(ToggleMenu('admin', '', this.state.sector.sector_id))
        } else {
            this.props.dispatch(ToggleMenu('', 'admin', this.state.sector.sector_id));
        }
    }

    changeStatus(val) {
        fetch.post('/api/admin/sector/change-status', {status: val, id: this.state.sector.sector_id})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.props.dispatch(ToggleMenu('', 'admin', this.state.sector.sector_id));

                this.setState({sector: resp.data.sector});
            } else {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/sector/change-status'));
    }

    renameSector(e) {
        if (e.keyCode === 13) {
            this.setState({status: 'Sending'});

            fetch.post('/api/admin/sector/rename', {id: this.state.sector.sector_id, name: this.state.sectorName})
            .then(resp => {
                if (resp.data.status === 'success') {
                    this.setState({status: '', sector: resp.data.sector, rename: false});
                } else if (resp.data.status === 'error') {
                    this.setState({status: ''});

                    this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
                }
            })
            .catch(err => LogError(err, '/api/admin/sector/rename'));
        }
    }

    render() {
        let sectorName, menu;

        if (this.state.rename) {
            sectorName = <input type='text' name='sector' className='sector-name-input w-95' defaultValue={this.state.sector.sector} onChange={(e) => this.setState({sectorName: e.target.value})} onKeyDown={(e) => this.renameSector(e)} disabled={this.state.status === 'Sending'} />;
        } else {
            sectorName = this.state.sector.sector;
        }

        if (this.props.menu.open === 'admin' && this.props.menu.id === this.state.sector.sector_id) {
            menu = <Menu items={['Open', 'Close', 'Delete']} onClick={(val) => this.changeStatus(val)} />;
        }

        if (this.state.sector) {  
            return (
                <div className='d-flex-center mb-3'>
                    <div className='w-5'>{this.state.sector.sector_id}</div>
                    <div className='w-35' onClick={() => this.setState({rename: true})}>{sectorName}</div>
                    <div className='w-25'>{moment(this.state.sector.sector_created_on).format('MMM DD YYYY')}</div>
                    <div className='w-20'>{this.state.sector.sector_created_by}</div>
                    <div className='w-10'>
                        <span className={this.state.sector.sector_status === 'Open' ? 'badge badge-success' : 'badge badge-warning'}>{this.state.sector.sector_status}</span>
                    </div>
                    <div className='w-5 position-relative text-right'>
                        <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}>{this.props.menu.open === 'admin' ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button>
                        {menu}
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