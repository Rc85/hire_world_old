import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import Menu from '../../utils/Menu';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import Loading from '../../utils/Loading';

class AdminPromoRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            promo: this.props.promo || {
                promo_code: '',
                promo_created_date: '',
                promo_description: '',
                promo_effective_end_date: '',
                promo_effective_start_date: '',
                promo_id: '',
                promo_name: '',
                promo_status: ''
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.promo.promo_id !== this.props.promo.promo_id) {
            this.setState({promo: this.props.promo});
        }
    }
        
    toggleMenu() {
        if (this.props.menu.open === 'admin promo' && this.props.menu.id === this.state.promo.promo_id) {
            this.props.dispatch(ToggleMenu('', 'admin promo', this.state.promo.promo_id));
        } else if (this.props.menu.open !== 'admin promo') {
            this.props.dispatch(ToggleMenu('admin promo', '', this.state.promo.promo_id));
        }
    }

    changeStatus(status) {
        this.setState({status: 'Loading'});

        fetch.post('/api/admin/promo/change-status', {id: this.state.promo.promo_id, status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', promo: resp.data.promo});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => console.log(err));
    }

    render() {
        console.log(this.state);
        let menu, status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        if (this.props.menu.open === 'admin promo' && this.props.menu.id === this.state.promo.promo_id) {
            menu = <Menu items={['Active', 'Inactive']} onClick={(status) => this.changeStatus(status)} />
        }

        return (
            <div className='admin-scroller-row mb-3'>
                {status}
                <div className='w-5'>{this.state.promo.promo_id}</div>
                <div className='w-15 text-truncate'>{this.state.promo.promo_name}</div>
                <div className='w-15'>{moment(this.state.promo.promo_effective_start_date).format('MM-DD-YYYY')}</div>
                <div className='w-15'>{moment(this.state.promo.promo_effective_end_date).format('MM-DD-YYYY')}</div>
                <div className='w-15'>{this.state.promo.promo_code}</div>
                <div className='w-25 text-truncate' title={this.state.promo.promo_description}>{this.state.promo.promo_description}</div>
                <div className='w-5 text-center'>{this.state.promo.promo_status === 'Active' ? <span className='badge badge-success'>{this.state.promo.promo_status}</span> : <span className='badge badge-danger'>{this.state.promo.promo_status}</span>}</div>
                <div className='w-5 text-right position-relative'>
                    <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}><FontAwesomeIcon icon={faCaretDown} /></button>

                    {menu}
                </div>
            </div>
        );
    }
}

AdminPromoRow.propTypes = {
    promo: PropTypes.object
};

const mapStateToProps = state => {
    return {
        menu: state.Menu
    }
}

export default connect(mapStateToProps)(AdminPromoRow);