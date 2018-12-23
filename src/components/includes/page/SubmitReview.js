import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextArea from '../../utils/TextArea';
import { NavLink } from 'react-router-dom';
import Rating from '../../utils/Rating';

class SubmitReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            starActive: this.props.stars || 0,
            star: this.props.stars || 0
        }
    }

    setRating(num) {
        if (this.state.star === num) {
            this.setState({star: 0});
        } else {
            this.setState({star: num});
        }
    }
    
    render() {
        let authMessage;

        if (this.props.message && this.props.message.review_token) {
            authMessage = <div className='mb-3'>
                <small><em>
                    This review is for {this.props.user.username === this.props.message.job_client ? <NavLink to={`/user/${this.props.message.job_user}`}>{this.props.message.job_user}</NavLink> : <NavLink to={`/user/${this.props.message.job_client}`}>{this.props.message.job_client}</NavLink>} and will hold a </em></small><span className='badge badge-success'>Job Complete Verified</span><small><em> tag that verifies a job was successfully completed. <NavLink to='/faqs'>Learn more</NavLink>.
                </em></small>
            </div>;
        }

        return (
            <div className='grey-panel rounded mb-3'>
                <div className='d-flex-between-center'>
                    {authMessage}

                    <div className='d-flex mb-3'>
                        <Rating star={this.state.star} set={(stars) => this.setState({star: stars})} />
                    </div>
                </div>
                <TextArea submit={(review) => this.props.submit(review, this.state.star)} cancel={() => this.props.cancel()} value={this.props.review} />
            </div>
        );
    }
}

SubmitReview.propTypes = {

}

export default SubmitReview;