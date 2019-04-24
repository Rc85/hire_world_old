import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import { ToggleMenu } from '../../../actions/MenuActions';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import Menu from '../../utils/Menu';
import Loading from '../../utils/Loading';
import { LogError } from '../../utils/LogError';

class AdminPlanRow extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            plan: this.props.plan || {
                plan_id: '',
                plan_name: '',
                plan_price: '',
                plan_created_date: '',
                plan_status: ''
            }
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.plan.plan_id !== this.props.plan.plan_id) {
            this.setState({plan: this.props.plan});
        }
    }
    
    toggleMenu() {
        if (this.props.menu.open === 'admin plan' && this.props.menu.id === this.state.plan.plan_id) {
            this.props.dispatch(ToggleMenu('', 'admin plan', this.state.plan.plan_id));
        } else if (this.props.menu.open !== 'admin plan') {
            this.props.dispatch(ToggleMenu('admin plan', '', this.state.plan.plan_id));
        }
    }

    changeStatus(status) {
        this.setState({status: 'Loading'});

        fetch.post('/api/admin/plan/change-status', {id: this.state.plan.plan_id, status: status})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', plan: resp.data.plan});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/admin/plan/change-status'));
    }

    render() {
        let menu, status;

        if (this.state.status === 'Loading') {
            status = <Loading size='5x' />;
        }

        if (this.props.menu.open === 'admin plan' && this.props.menu.id === this.state.plan.plan_id) {
            menu = <Menu items={['Active', 'Inactive']} onClick={(status) => this.changeStatus(status)} />;
        }

        return (
            <div className='admin-scroller-row mb-3'>
                {status}
                <div className='w-5'>{this.state.plan.plan_id}</div>
                <div className='w-40'>{this.state.plan.plan_name}</div>
                <div className='w-25'>${this.state.plan.plan_price} / Month</div>
                <div className='w-25'>{moment(this.state.plan.plan_created_date).format('MM-DD-YYYY') !== 'Invalid date' ? moment(this.state.plan.plan_created_date).format('MM-DD-YYYY') : ''}</div>
                <div className='w-5 text-center'>{this.state.plan.plan_status === 'Active' ? <span className='badge badge-success'>{this.state.plan.plan_status}</span> : <span className='badge badge-danger'>{this.state.plan.plan_status}</span>}</div>
                <div className='w-5 text-right position-relative'>
                    <button className='btn btn-info btn-sm admin-menu-button' onClick={() => this.toggleMenu()}>{this.props.menu.open === 'admin plan' ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</button>
                    {menu}
                </div>
            </div>
        );
    }
}

AdminPlanRow.propTypes = {
    plan: PropTypes.object
};

const mapStateToProps = state => {
    return {
        menu: state.Menu
    }
}

export default connect(mapStateToProps)(AdminPlanRow);