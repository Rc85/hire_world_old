import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserProfilePic from '../page/UserProfilePic';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faColumns, faCommentAlt, faCog, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';
import { LogoutUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

class SideBar extends Component {
    render() {
        return (
            <section id='sidebar'>
                <div className='text-center'><img src='/images/logo_sm.png' id='m-ploy-logo' onClick={() => location.href = '/'} /></div>

                <div id='sidebar-buttons-container'>
                    <div className='sidebar-button'><FontAwesomeIcon icon={faQuestionCircle} size='lg' /></div>
                    <div className='notification-button-container sidebar-button'><FontAwesomeIcon icon={faBell} size='lg' /></div>
                </div>

                <hr className='w-90' />

                <div id='sidebar-links'>
                    {this.props.items.map((item, i) => {
                        let messageCount = 0;

                        if (item.messageCount && parseInt(item.messageCount) > 0) {
                            messageCount = parseInt(item.messageCount);
                        }

                        return <div key={i} className='sidebar-link-container'>
                            <Link
                            text={<h5>{item.name}</h5>}
                            link={item.link}
                            icon={item.icon}
                            active={item.active}
                            items={item.items}
                            messageCount={messageCount > 0 ? messageCount : false} />
                        </div>
                    })}

                    <div className='sidebar-link-container'>
                        <Link text={<h5>Logout</h5>} icon={<FontAwesomeIcon icon={faSignOutAlt} />} onClick={() => this.props.dispatch(LogoutUser())} />
                    </div>
                </div>
            </section>
        );
    }
}

class Link extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            hover: false
        }
    }

    handleMouseOver() {
        if (!this.props.active) {
            this.setState({hover: true});
        }
    }
    
    render() {
        let subItems, link, messageCount;

        if (this.props.active) {
            subItems = this.props.items.map((item, i) => {
                return <NavLink to={item.link}><div key={i} className={`sidebar-sub-item ${item.active ? 'active' : ''}`}><div className='sidebar-sub-item-link'>{item.name}</div> {item.messageCount > 0 ? <span className='mini-badge mini-badge-danger'>{item.messageCount}</span> : ''}</div></NavLink>
            });
        }

        if (parseInt(this.props.messageCount) > 0) {
            messageCount = <div className='mini-badge mini-badge-danger'>{this.props.messageCount}</div>
        }

        if (this.props.onClick) {
            link = <div className={`sidebar-link-item-container ${this.props.active ? 'active' : ''}`} onMouseOver={() => this.handleMouseOver()} onMouseOut={() => this.setState({hover: false})}>
                <div className='sidebar-link-item-wrapper'>
                    <div className='sidebar-link-item' onClick={() => this.props.onClick()}>
                        {this.props.icon ? <div className='sidebar-link-icon'>{this.props.icon}</div> : ''}
                        <div className='sidebar-link-text'>{this.props.text}</div>
                    </div>
                    <div className={`sidebar-link-underline ${this.state.hover ? 'hover' : ''}`}></div>
                </div>
            </div>;
        } else {
            link = <NavLink to={this.props.link}>
                <div className={`sidebar-link-item-container ${this.props.active ? 'active' : ''}`} onMouseOver={() => this.handleMouseOver()} onMouseOut={() => this.setState({hover: false})}>
                    <div className='sidebar-link-item-wrapper'>
                        <div className='sidebar-link-item'>
                            {this.props.icon ? <div className='sidebar-link-icon'>{this.props.icon}</div> : ''}
                            <div className='sidebar-link-text'>{this.props.text}</div>
                            {messageCount}
                        </div>
                        <div className={`sidebar-link-underline ${this.state.hover ? 'hover' : ''}`}></div>
                    </div>
                </div>
            </NavLink>;
        }

        return(
            <React.Fragment>
                {link}

                {this.props.active ? <div className='sidebar-sub-items-container'>{subItems}</div> : ''}
            </React.Fragment>
        )
    }
}

SideBar.propTypes = {

};

export default withRouter(connect()(SideBar));