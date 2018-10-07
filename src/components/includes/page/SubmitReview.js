import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import TextArea from '../../utils/TextArea';
import { NavLink } from 'react-router-dom';

class SubmitReview extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            starActive: this.props.stars || 0,
            star: this.props.stars || 0
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
            <div className='grey-panel rounded'>
                <div className='d-flex-between-center'>
                    {authMessage}

                    <div className='d-flex mb-3'>
                        <div className={`${this.state.starActive >= 1 ? 'review-star active' : 'review-star'} mr-1`}
                        onClick={() => this.setState({star: 1})}
                        onMouseOver={() => this.setState({starActive: 1})}
                        onMouseOut={() => this.setState({starActive: this.state.star})}>
                            <FontAwesomeIcon icon={faStar} />
                        </div>

                        <div className={`${this.state.starActive >= 2 ? 'review-star active' : 'review-star'} mr-1`}
                        onClick={() => this.setState({star: 2})}
                        onMouseOver={() => this.setState({starActive: 2})}
                        onMouseOut={() => this.setState({starActive: this.state.star})}>
                            <FontAwesomeIcon icon={faStar} />
                        </div>

                        <div className={`${this.state.starActive >= 3 ? 'review-star active' : 'review-star'} mr-1`}
                        onClick={() => this.setState({star: 3})}
                        onMouseOver={() => this.setState({starActive: 3})}
                        onMouseOut={() => this.setState({starActive: this.state.star})}>
                            <FontAwesomeIcon icon={faStar} />
                        </div>

                        <div className={`${this.state.starActive >= 4 ? 'review-star active' : 'review-star'} mr-1`}
                        onClick={() => this.setState({star: 4})}
                        onMouseOver={() => this.setState({starActive: 4})}
                        onMouseOut={() => this.setState({starActive: this.state.star})}>
                            <FontAwesomeIcon icon={faStar} />
                        </div>

                        <div className={`${this.state.starActive >= 5 ? 'review-star active' : 'review-star'} mr-1`}
                        onClick={() => this.setState({star: 5})}
                        onMouseOver={() => this.setState({starActive: 5})}
                        onMouseOut={() => this.setState({starActive: this.state.star})}>
                            <FontAwesomeIcon icon={faStar} />
                        </div>
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