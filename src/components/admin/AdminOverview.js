import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class AdminOverview extends Component {
    componentDidUpdate(prevProps, prevState) {
        console.log('updated');
        console.log(this.props.user);
    }
    
    componentDidMount() {
        console.log('mounted');
        console.log(this.props.user);
    }
    
    render() {
        return(
            <div className='blue-panel shallow three-rounded'>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(AdminOverview));