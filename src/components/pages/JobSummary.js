import React, { Component } from 'react';
import PropTypes from 'prop-types';

class JobSummary extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: ''
        }
    }
    
    componentDidMount() {

    }
    
    render() {
        return (
            <section id='jobs' className='main-panel'>

            </section>
        );
    }
}

JobSummary.propTypes = {

};

export default JobSummary;