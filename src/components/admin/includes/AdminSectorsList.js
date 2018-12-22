import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Loading from '../../utils/Loading';
import AdminSectorRow from './AdminSectorRow';
import PropTypes from 'prop-types';

class AdminSectorsList extends Component {
    render() {
        let sectors = this.props.sectors.map((sector, i) => {
            return <AdminSectorRow key={i} sector={sector} />
        });

        return(
            <div id='sectors-list'>
                {this.props.status === 'add sector loading' ? <Loading size='5x' /> : ''}

                <div className='d-flex-center'>
                    <div className='w-5'><strong>ID</strong></div>
                    <div className='w-35'><strong>Name</strong></div>
                    <div className='w-25'><strong>Created On</strong></div>
                    <div className='w-20'><strong>Created By</strong></div>
                    <div className='w-10'><strong>Status</strong></div>
                    <div className='w-5'></div>
                </div>

                <hr/>

                {sectors}
            </div>
        )
    }
}

AdminSectorsList.propTypes = {
    sectors: PropTypes.array
}

export default connect()(AdminSectorsList);