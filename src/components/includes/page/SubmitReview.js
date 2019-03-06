import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextArea from '../../utils/TextArea';
import { NavLink } from 'react-router-dom';
import Rating from '../../utils/Rating';
import SubmitButton from '../../utils/SubmitButton';

class SubmitReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            stars: this.props.stars || 0,
            review: ''
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
            <div className={`submit-review-container ${this.props.show ? 'show' : ''} ${this.props.className ? this.props.className : ''}`}>
                <div className='submit-review'>
                    <div className='submit-review-header'>
                        {authMessage}
    
                        <Rating stars={this.state.stars} set={(stars) => this.setRating(stars)} />
                    </div>
    
                    <TextArea label='Review' value={this.state.review} defaultValue={this.props.review ? this.props.review.review : ''} onChange={(val) => this.setState({review: val})} textAreaClassName='w-100 mb-2' placeholder={this.props.placeholder} />

                    <div className='text-right'><SubmitButton type='button' status={this.props.status} onClick={() => this.props.submit(this.state.review, this.state.stars)} /> <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button></div>
                </div>
            </div>
        );
    }
}

SubmitReview.propTypes = {
    submit: PropTypes.func,
    cancel: PropTypes.func,
    review: PropTypes.object,
    stars: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    show: PropTypes.bool
}

export default SubmitReview;