import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { AddSector } from '../../actions/AddSectorActions';
import { FontAwesomeIcon } from '../../../node_modules/@fortawesome/react-fontawesome';
import { faCircleNotch } from '../../../node_modules/@fortawesome/free-solid-svg-icons';
import AdminSectorsList from './includes/AdminSectorsList';
import { Alert } from '../../actions/AlertActions';
import fetch from 'axios';

class AdminSectors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sector: null,
            sectors: []
        }

        this.addSector = this.addSector.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
    }
    
    componentDidMount() {
        fetch.get('/api/admin/sectors/get')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({sectors: resp.data.sectors});
            } else if (resp.data.status === 'error') {
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
    }

    addSector() {
        this.props.dispatch(AddSector(this.state.sector));
        this.setState({
            sector: null
        });
        document.getElementById('sector-input').value = '';
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

                <AdminSectorsList sectors={this.state.sectors} />
            </div>
        )
    }
}

AdminSectors.propTypes = {
    user: PropTypes.object
}

export default withRouter(connect()(AdminSectors));