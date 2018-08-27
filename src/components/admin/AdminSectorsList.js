import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/admin/AdminSectorsList.css';
import '../../styles/admin/Admin.css';
import Loading from '../utils/Loading';
import Menu from '../utils/Menu';

class AdminSectorsList extends Component {
    render() {
        let sectors;

        if (this.props.sectors) {
            sectors = this.props.sectors.map((sector, i) => {
                return <div key={i} className='admin-sector-row mb-2'>
                    <div className='w-5'>{sector.sector_id}</div>
                    <div className='w-35'>{sector.sector}</div>
                    <div className='w-25'>{sector.sector_created_on}</div>
                    <div className='w-20'>{sector.sector_created_by}</div>
                    <div className='w-10'>
                        <span className='badge badge-success'>{sector.sector_status}</span>
                    </div>
                    <Menu name={`admin-menu-${sector.sector_id}`} id={sector.sector_id} />
                </div>
            });
        } else {
            sectors = <Loading size='4x' />;
        }

        return(
            <div id='sectors-list'>
                {this.props.status === 'add sector loading' ? <Loading size='4x' /> : ''}

                <div className='admin-sector-header'>
                    <div className='w-5'>ID</div>
                    <div className='w-35'>Name</div>
                    <div className='w-25'>Created On</div>
                    <div className='w-20'>Created By</div>
                    <div className='w-10'>Status</div>
                    <div className='w-5'></div>
                </div>

                <hr/>

                {sectors}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Sectors.status,
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(AdminSectorsList));