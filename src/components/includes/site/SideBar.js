import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBell, faThList, faUserCircle, faUserFriends, faUserSlash } from '@fortawesome/pro-solid-svg-icons';
import { LogoutUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import Loading from '../../utils/Loading';
import BrowseMenu from '../site/BrowseMenu';
import { ToggleMenu } from '../../../actions/MenuActions';
import NotificationPanel from '../site/NotificationPanel';
import LoginPanel from './LoginPanel';
import TwoFactorLogin from './TwoFactorLogin';
import moment from 'moment';

class SideBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: false
        }
    }
    
    toggleMenu(e) {
        e.stopPropagation();

        if (this.props.menu.id === 'browse-menu' && this.props.menu.show) {
            this.props.dispatch(ToggleMenu(false, ''));
        } else {
            this.props.dispatch(ToggleMenu(true, 'browse-menu'));
        }
    }

    showNotificationPanel(e) {
        e.stopPropagation();

        if (this.props.menu.id = 'notification-panel' && this.props.menu.show) {
            this.props.dispatch(ToggleMenu(false, ''));
        } else {
            this.props.dispatch(ToggleMenu(true, 'notification-panel'));
        }
    }
    
    render() {
        let browseLink = <div className='sidebar-link-container'>
            <Link
            className='browse-listing-link'
            text={`Browse`}
            onClick={(e) => this.toggleMenu(e)}
            icon={<FontAwesomeIcon icon={faThList} />}
            active={/^\/(browse|sector|user)/.test(this.props.location.pathname) || (this.props.menu.id === 'browse-menu' && this.props.menu.show)} />

            <BrowseMenu show={this.props.menu.id === 'browse-menu' && this.props.menu.show} />
        </div>;

        let sidebarContent;

        if (this.props.user.user) {
            sidebarContent = <div id='sidebar-content'>
                <React.Fragment>
                    <div id='sidebar-buttons-container'>
                        <div><FontAwesomeIcon icon={faUserCircle} className='text-highlight mr-1' /> <NavLink to='/dashboard'>{this.props.user.user.username}</NavLink></div>

                        <div><NavLink to='/dashboard/friends'><FontAwesomeIcon icon={faUserFriends} className={this.props.location.pathname === '/dashboard/friends' ? 'text-highlight' : ''} /></NavLink></div>

                        <div><NavLink to='/dashboard/blocked-users'><FontAwesomeIcon icon={faUserSlash} /></NavLink></div>
                        
                        <React.Fragment><div className='notification-button-container' onClick={(e) => this.showNotificationPanel(e)}>{parseInt(this.props.user.notifications) > 0 ? <span className='notification-counter mini-badge mini-badge-danger'>{this.props.user.notifications}</span> : ''}<FontAwesomeIcon icon={faBell} size='lg' id='notification-icon'/><NotificationPanel show={this.props.menu.id === 'notification-panel' && this.props.menu.show} user={this.props.user} /></div></React.Fragment>
                    </div>

                    <hr className='w-90' />
                    
                    <div id='sidebar-links'>
                        {browseLink}
                        {this.props.items.map((item, i) => {
                            if (this.props.user.user && (this.props.user.user.link_work_id || moment(this.props.user.user.subscription_end_date).diff(moment(), 'days') < 0) && item.name === 'Link Work') {
                                return null;
                            }
                            
                            return <div key={i} className='sidebar-link-container'>
                                <Link
                                name={item.name}
                                text={item.name}
                                link={item.link}
                                icon={item.icon}
                                active={item.active}
                                items={item.items}
                                messageCount={parseInt(item.messageCount) > 0 ? parseInt(item.messageCount) : false}
                                user={this.props.user} />
                            </div>
                        })}

                        <div className='sidebar-link-container'>
                            <Link text={'Logout'} icon={<FontAwesomeIcon icon={faSignOutAlt} />} onClick={() => this.props.dispatch(LogoutUser())} />
                        </div>
                    </div>
                </React.Fragment>
            </div>;
        } else if (this.props.user.status === 'error' || this.props.user.status === 'not logged in' || this.props.user.status === 'activation required') {
            sidebarContent = <div id='sidebar-content'>
                <React.Fragment>
                    <div id='sidebar-links'>
                        {browseLink}
                    </div>

                    <LoginPanel />
                </React.Fragment>
            </div>;
        } else if (this.props.user.status === '2fa required') {
            sidebarContent = <div id='sidebar-content'>
                <React.Fragment>
                    <div id='sidebar-links'>
                        {browseLink}
                    </div>

                    <TwoFactorLogin />
                </React.Fragment>
            </div>
        } else if (this.props.user.status === 'login begin') {
            sidebarContent = <div id='sidebar-content'>
                <Loading size='5x' className='mt-5' />
            </div>;
        }

        return (
            <section id='sidebar'>
                <div className='text-center'><NavLink to='/main'><img src='/images/logo_xl.png' id='hireworld-logo' /></NavLink></div>

                {sidebarContent}
            </section>
        )
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

        if (this.props.active && this.props.items) {
            subItems = this.props.items.map((item, i) => {
                if (this.props.user.user && !this.props.user.user.link_work_id && item.name === 'Link Work') {
                    return null;
                }

                return <NavLink key={i} to={item.link}><div className={`sidebar-sub-item`}><div className={`sidebar-sub-item-link ${item.active ? 'active' : ''}`}>{item.name}</div> {item.messageCount > 0 ? <span className='mini-badge mini-badge-danger'>{item.messageCount}</span> : ''}</div></NavLink>
            });
        }

        if (this.props.messageCount > 0) {
            messageCount = <div className='mini-badge mini-badge-danger'>{this.props.messageCount}</div>
        }

        if (this.props.onClick) {
            link = <div className={`sidebar-link-item-container ${this.props.active ? 'active' : ''} ${this.props.className ? this.props.className : ''}`} onMouseOver={() => this.handleMouseOver()} onMouseOut={() => this.setState({hover: false})} onClick={(e) => this.props.onClick(e)}>
                <div className={`sidebar-link-item-wrapper ${this.props.className ? this.props.className : ''}`}>
                    <div className={`sidebar-link-item ${this.props.className ? this.props.className : ''}`}>
                        {this.props.icon ? <div className={`sidebar-link-icon ${this.props.active ? 'active' : ''} ${this.props.className ? this.props.className : ''}`}>{this.props.icon}</div> : ''}
                        <div className={`sidebar-link-text ${this.props.className ? this.props.className : ''}`}><h5>{this.props.text}</h5></div>
                    </div>
                    <div className={`sidebar-link-underline ${this.state.hover ? 'hover' : ''} ${this.props.className ? this.props.className : ''}`}></div>
                </div>
            </div>;
        } else {
            link = <NavLink to={this.props.link}>
                <div className={`sidebar-link-item-container ${this.props.active ? 'active' : ''}`} onMouseOver={() => this.handleMouseOver()} onMouseOut={() => this.setState({hover: false})}>
                    <div className='sidebar-link-item-wrapper'>
                        <div className='sidebar-link-item'>
                            {this.props.icon ? <div className={`sidebar-link-icon ${this.props.active ? 'active' : ''}`}>{this.props.icon}</div> : ''}
                            <div className='sidebar-link-text'><h5>{this.props.text}</h5></div>
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
    user: PropTypes.object,
    items: PropTypes.array
};

const mapStateToProps = state => {
    return {
        menu: state.Menu
    }
}

export default withRouter(connect(mapStateToProps)(SideBar));