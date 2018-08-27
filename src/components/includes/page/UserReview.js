import React, { Component } from 'react';
import userProfilePic from '../../../images/profile.png';
import UserReviewRating from './UserReviewRating';

class UserReview extends Component {
    render() {
        return(
            <div id='user-reviews'>
                <h1 className='mb-5'>Reviews</h1>

                <div className='reviews'>
                    <div className='row review'>
                        <div className='text-center col-2'>
                            <div className='user-profile-pic' style={{background: `url(${userProfilePic})`, backgroundSize: 'contain', backgroundPosition: 'center top'}}></div>
                            <span>user_10250603</span>
                        </div>
    
                        <div className='col-10'>
                            <div className='review-header'>
                                <h5>This is a review title</h5>
                                <span className='review-date-time'>08/04/2018 @ 6:28 PM</span>
                                <UserReviewRating rating={4}/>
                            </div>
                                
                            <hr/>
    
                            <div className='review-body'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Suscipit ut tempore error eaque saepe totam repudiandae pariatur libero maxime nisi excepturi et doloribus quaerat vero itaque asperiores porro, consequatur voluptatibus.</div>

                            <div className='review-footer'>
                                <a href='/review/report'>Report</a>
                            </div>
                        </div>
                    </div>

                    <div className='row review'>
                        <div className='text-center col-2'>
                            <div className='user-profile-pic' style={{background: `url(${userProfilePic})`, backgroundSize: 'contain', backgroundPosition: 'center top'}}></div>
                            <span>user_10250603</span>
                        </div>
    
                        <div className='col-10'>
                            <div className='review-header'>
                                <h5>This is a review title</h5>
                                <span className='review-date-time'>08/04/2018 @ 6:28 PM</span>
                                <UserReviewRating rating={2} />
                            </div>
                                
                            <hr/>
    
                            <div className='review-body'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Suscipit ut tempore error eaque saepe totam repudiandae pariatur libero maxime nisi excepturi et doloribus quaerat vero itaque asperiores porro, consequatur voluptatibus.</div>

                            <div className='review-footer'>
                                <a href='/review/report'>Report</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default UserReview;