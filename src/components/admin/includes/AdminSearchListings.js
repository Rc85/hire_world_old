import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AdminSearchListings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            title: '',
            sector: '',
            user: ''
        }
    }
    
    render() {
        let sectors = this.props.sectors.map((sector, i) => {
            return <option key={i} value={sector.sector}>{sector.sector}</option>
        });

        return (
            <div id='search-listings' className='mb-5'>
                <div className='d-flex-between-center mb-1'>
                    <div className='w-30'>
                        <label htmlFor='search-title'>Title:</label>
                        <input type='text' name='title' id='search-title' className='form-control' onChange={(e) => this.setState({title: e.target.value})} />
                    </div>
    
                    <div className='w-30'>
                        <label htmlFor='search-sectors'>Sector:</label>
                        <select name='sector' id='search-sectors' className='form-control' onChange={(e) => this.setState({sector: e.target.value})}>\
                            <option></option>
                            {sectors}
                        </select>
                    </div>
    
                    <div className='w-30'>
                        <label htmlFor='search-user'>User:</label>
                        <input type='text' name='user' id='search-user' className='form-control' onChange={(e) => this.setState({user: e.target.value})} />
                    </div>
                </div>

                <div className='text-right'><button className='btn btn-primary' onClick={() => this.props.filter(this.state)}>Filter</button></div>
            </div>
        );
    }
}

AdminSearchListings.propTypes = {

};

export default AdminSearchListings;