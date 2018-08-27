import React, { Component } from 'react';
import UserReviewRating from './UserReviewRating';

class ViewUserProfile extends Component {
    render() {
        return(
            <div id='view-user-profile'>
                <div id='view-user-title'>
                    <h1 className='d-flex'>
                        <span className='mr-2'>JOHN DOE</span>
                        <UserReviewRating />
                    </h1>

                    <h4>Full Stack Web Developer</h4>
                    <span>British Columbia Institution of Technology</span>
                </div>

                <div id='view-user-details' className='rounded'>
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ad tempora iure vero beatae obcaecati fugiat consequatur harum sit deleniti id officiis magnam temporibus deserunt illo, nulla ullam amet mollitia minus?</p>

                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius cupiditate nemo reprehenderit, incidunt autem ea quibusdam temporibus harum eum, exercitationem ab provident velit voluptate quos alias laboriosam blanditiis repellendus quod?</p>
                </div>
            </div>
        )
    }
}

export default ViewUserProfile;