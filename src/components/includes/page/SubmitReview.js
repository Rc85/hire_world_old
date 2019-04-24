import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextArea from '../../utils/TextArea';
import { NavLink } from 'react-router-dom';
import Rating from '../../utils/Rating';
import SubmitButton from '../../utils/SubmitButton';
import Username from './Username';

class SubmitReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            stars: this.props.stars || 0,
            review: this.props.review ? this.props.review.review : ''
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

        if (this.props.review && this.props.review.token) {
            authMessage = <div>
                <span>This review is for {this.props.user.user && this.props.user.user.username === this.props.review.reviewer ? <Username username={this.props.review.reviewing} color='alt-highlight' /> : <NavLink to={`/user/${this.props.review.reviewer}`}>{this.props.review.reviewer}</NavLink>} and will hold a <span className='mini-badge mini-badge-success'>Job Complete Verified</span> tag that indicates a job was successfully completed. See <NavLink to='/faq'>FAQs</NavLink> for more details.</span>
            </div>;
        }
        return (
            <div className={`submit-review-container`}>
                <div className='submit-review'>
                    <div className='submit-review-header'>
                        {authMessage}
    
                        <Rating stars={this.state.stars} set={(stars) => this.setRating(stars)} />

                    </div>

                    {this.props.review && this.props.review.review && this.props.review.review_rating && parseInt(this.props.review.review_count) > 1 && this.props.review.token_status === 'Valid' ?
                    <div className='mb-3'><em>You already reviewed this user. By submitting another will, the rating and your review will be overwritten by this one and a +1 will be added to the counter in the review. The more pluses, the better!</em></div> : ''}
    
                    <TextArea defaultValue={this.state.review} onChange={(val) => this.setState({review: val})} textAreaClassName='w-100 mb-2' placeholder={this.props.placeholder} />

                    <div className='text-right'><SubmitButton type='button' loading={this.props.status === 'Submitting Review'} onClick={() => this.props.submit(this.state.review, this.state.stars)} /> <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button></div>
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