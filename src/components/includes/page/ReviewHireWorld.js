import React, { Component } from 'react';
import Rating from '../../utils/Rating';
import Loading from '../../utils/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import fetch from 'axios';
import { Alert } from '../../../actions/AlertActions';
import { LogError } from '../../utils/LogError';
import { connect } from 'react-redux';

class ReviewHireWorld extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: ''
        }
    }

    submit(stars) {
        this.setState({status: 'Sending'});

        fetch.post('/api/site/review', {stars: stars})
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: 'Rated'});
            } else {
                this.setState({status: ''});
                this.props.dispatch(Alert(resp.data.status, resp.data.statusMessage));
            }
        })
        .catch(err => LogError(err, '/api/site/review'));
    }
    
    render() {
        if (this.state.status === 'Sending') {
            return <div className='position-relative'><Loading size='2x' /></div>;
        } else if (this.state.status === 'Rated') {
            return <div>
                <FontAwesomeIcon icon={faCheckCircle} size='2x' color='limegreen' />
                <div>Thank You!</div>
            </div>;
        }

        return (
            <div id='review-hireworld'>
                <Rating set={(stars) => this.submit(stars)} />
            </div>
        );
    }
}

export default connect()(ReviewHireWorld);