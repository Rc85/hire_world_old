import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextArea from '../../utils/TextArea';
import { NavLink } from 'react-router-dom';
import Rating from '../../utils/Rating';

class SubmitReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            stars: this.props.stars || 0
        }
    }

    setRating(num) {
        if (this.state.stars === num) {
            this.setState({stars: 0});
        } else {
            this.setState({stars: num});
        }
    }
    
    render() {
        let authMessage;

        if (this.props.message && this.props.message.review_token) {
            authMessage = <div className='mb-3'>
                <small><em>
                    This review is for {this.props.user.username === this.props.message.job_client ? <NavLink to={`/user/${this.props.message.job_user}`}>{this.props.message.job_user}</NavLink> : <NavLink to={`/user/${this.props.message.job_client}`}>{this.props.message.job_client}</NavLink>} and will hold a <span className='mini-badge mini-badge-success'><em>Job Complete Verified</em></span> tag that verifies a job was successfully completed. See FAQs for more details.
                </em></small>
            </div>;
        }

        return (
            <div className={`review-container ${this.props.show ? 'show' : ''}`}>
                <div className='review'>
                    <div className='review-header'>
                        {authMessage}
    
                        <Rating stars={this.state.stars} set={(stars) => this.setRating(stars)} />
                    </div>
    
                    <TextArea submit={(review) => this.props.submit(review, this.state.stars)} cancel={() => this.props.cancel()} value={this.props.review} status={this.props.status} />
                </div>
            </div>
        );
    }
}

SubmitReview.propTypes = {

}

export default SubmitReview;