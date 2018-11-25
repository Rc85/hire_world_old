import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '../../../node_modules/@fortawesome/react-fontawesome';
import { faCircleNotch } from '../../../node_modules/@fortawesome/free-solid-svg-icons';
import AdminSectorsList from './includes/AdminSectorsList';
import { Alert } from '../../actions/AlertActions';
import fetch from 'axios';
import { LogError } from '../utils/LogError';

class AdminSectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '',
            sector: null,
            sectors: []
        }

        this.addSector = this.addSector.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.sectors !== prevProps.sectors) {
            this.setState({sectors: this.props.sectors});
        }
    }
    
    addSector() {
        this.setState({status: 'Loading'});

        fetch.post('/api/admin/sector/add', {sector: this.state.sector})
        .then(resp => {
            if (resp.data.status === 'success') {
                let sectors = [...this.state.sectors];
                sectors.push(resp.data.sector);
                sectors.sort();

                this.setState({status: '', sectors: sectors, sector: null});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }

            this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
        })
        .catch(err => LogError(err, '/api/admin/sector/add'));
    }

    render() {
        return(
            <div className='blue-panel shallow three-rounded'>
                <div className='input-group mb-5'>
                    <input type='text' id='sector-input' name='sector' className='form-control' placeholder='Sector name' aria-label='Sector name' aria-describedby='sector-name'
                    onChange={(e) => {
                        this.setState({
                            sector: e.target.value
                        });
                    }}
                    onKeyDown={(e) => {
                        if (e.keyCode === 13) {
                            this.addSector();
                        }
                    }} />
                    <div className='input-group-append'>
                        <button className='btn btn-primary' id='sector-name' onClick={this.addSector} disabled={this.props.status === 'add sector loading' ? true : false}>
                            {this.props.status === 'add sector loading' ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Add'}
                        </button>
                    </div>
                </div>

                <AdminSectorsList sectors={this.state.sectors} changeStatus={(status, id) => this.changeStatus(status, id)} />
            </div>
        )
    }
}

AdminSectors.propTypes = {
    user: PropTypes.object
}

export default withRouter(connect()(AdminSectors));