import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserProfilePic from './UserProfilePic';

class Row extends Component {
    render() {
        return (
            <div className='row'>
                <div className='row-container'>
                    {this.props.url ? <UserProfilePic url={this.props.url} /> : ''}
                    <div className='row-main'>
                        <div className='row-title'>
                            {this.props.title}
                        </div>

                        <div className='row-details'>
                            {this.props.details}
                        </div>
                    </div>

                    <div className='row-buttons'>
                        {this.props.buttons}
                    </div>
                </div>

                {this.props.index + 1 !== this.props.length ? <hr /> : ''}
            </div>
        );
    }
}

Row.propTypes = {

};

export default Row;