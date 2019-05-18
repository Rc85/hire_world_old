import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faThList, faTimes, faBars, faBell, faUserCircle, faUserFriends, faUserSlash, faHome, faArrowLeft, faBriefcase } from '@fortawesome/pro-solid-svg-icons';
import { LogoutUser } from '../actions/LoginActions';
import { connect } from 'react-redux';
import LoginPanel from './LoginPanel';
import NotificationPanel from './NotificationPanel';
import { ToggleMenu } from '../actions/MenuActions';

class BottomBar extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showBottomBar: false,
            showMenu: false,
            showSectors: false
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.showBottomBar !== this.state.showBottomBar) {
            if (this.state.showBottomBar) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }

        if (prevProps.location.key !== this.props.location.key) {
            this.setState({showBottomBar: false, showMenu: false, showSectors: false});
        }
    }
    
    toggleMenu() {
        this.setState({showBottomBar: !this.state.showBottomBar, showMenu: !this.state.showMenu, showSectors: false});
    }

    componentWillUnmount() {
        document.body.style.overflow = 'auto';
    }
    
    showNotificationPanel(e) {
        e.stopPropagation();

        if (this.props.menu.id === 'notification-panel' && this.props.menu.show) {
            this.props.dispatch(ToggleMenu(false, 'notification-panel'));
        } else {
            this.props.dispatch(ToggleMenu(true, 'notification-panel'));
        }
    }
    
    render() {
        let bottombarContent;

        if (this.props.user.user) {
            bottombarContent = <React.Fragment>
                {this.props.items.map((item, i) => {
                    if (this.props.user.user && this.props.user.user.link_work_acct_status === 'Approved' && item.name === 'Link Work') {
                        return null
                    }

                    return <div key={i} className='bottombar-item'>
                        <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'>{item.icon}</div><NavLink to={item.link}>{item.name}</NavLink> {parseInt(item.messageCount) > 0 ? <div className='bottombar-message-indicator'>{item.messageCount}</div> : ''}</div>

                        <div className='bottombar-sub-item-container'>
                            {item.items ? item.items.map((subItem, index) => {
                                return <div key={index} className='bottombar-sub-item'><NavLink to={subItem.link}>{subItem.name}</NavLink> {subItem.messageCount > 0 ? <span className='bottombar-message-indicator'>{subItem.messageCount}</span> : ''}</div>
                            }) : false}
                        </div>
                    </div>
                })}

                <div className='bottombar-item-wrapper mb-1' onClick={() => this.props.dispatch(LogoutUser())}>
                    <div className='bottombar-item-icon'><FontAwesomeIcon icon={faSignOutAlt} /></div>
                    <div><strong>Logout</strong></div>
                </div>
            </React.Fragment>;
        } else {
            bottombarContent = <div className='mt-5'><LoginPanel /></div >;
        }

        return (
            <div id='bottombar-container' className={`${this.props.config.typing ? 'hide' : ''}`}>
                <div id='bottombar' className={`${!this.state.showMenu ? '' : 'expand'} ${this.props.config.loginIn ? 'no-padding' : ''}`}>
                    <div className={`bottombar-item-container`}>
                        <NavLink to='/'><img src='/images/logo_md.png' className='bottombar-site-logo' /></NavLink>
                        <div className='bottombar-item'>
                            <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'><FontAwesomeIcon icon={faHome} /></div><NavLink to='/main'>Main</NavLink></div>
                        </div>

                        <div className='bottombar-item'>
                            <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'><FontAwesomeIcon icon={faThList} /></div><strong onClick={() => this.setState({showType: true})}>Browse</strong></div>
                        </div>

                        {bottombarContent}
                    </div>

                    <div id='bottombar-sectors-container' className={this.state.showType ? 'show' : ''}>
                        <div className='bottombar-sectors'>
                            <div className='text-right'>
                                <FontAwesomeIcon icon={faArrowLeft} size='lg' onClick={() => this.setState({type: '', showType: false, showSectors: false, showMenu: true})} className='mr-2' />
                                <FontAwesomeIcon icon={faTimes} size='lg' onClick={() => this.setState({showSectors: false, showMenu: false, showType: false})} className='mr-2' />
                            </div>
                            <div className='bottombar-link-div' onClick={() => this.setState({type: 'jobs', showType: false, showSectors: true})}><FontAwesomeIcon icon={faBriefcase} className='mr-2' /> Jobs</div>
                            <div className='bottombar-link-div' onClick={() => this.setState({type: 'profiles', showType: false, showSectors: true})}><FontAwesomeIcon icon={faUserCircle} className='mr-2' /> Profiles</div>
                        </div>
                    </div>

                    <div id='bottombar-sectors-container' className={this.state.showSectors ? 'show' : ''}>
                        <div id='bottombar-sectors'>
                            <div className='text-right'>
                                <FontAwesomeIcon icon={faArrowLeft} size='lg' onClick={() => this.setState({type: '', showType: true, showSectors: false})} className='mr-2' />
                                <FontAwesomeIcon icon={faTimes} size='lg' onClick={() => this.setState({showSectors: false, showMenu: false, showType: false})} className='mr-2' />
                            </div>

                            {this.props.sectors.map((sector, i) => {
                                return <div key={i}><NavLink to={`/sectors/${this.state.type}/${sector.sector}`}>{sector.sector}</NavLink></div>
                            })}
                        </div>
                    </div>
                </div>
                
                {!this.props.config.loginIn ? <div className='bottombar-toggle-buttons'>
                    <div id='bottombar-button-container'>
                        {this.props.user.user ?
                        <div id='bottombar-dashboard-buttons'>
                            <NavLink to='/dashboard'><FontAwesomeIcon icon={faUserCircle} size='2x' className='mr-2' /></NavLink>
                            <NavLink to='/dashboard/friends'><FontAwesomeIcon icon={faUserFriends} size='2x' className='mr-2' /></NavLink>
                            <NavLink to='/dashboard/blocked-users'><FontAwesomeIcon icon={faUserSlash} size='2x' className='mr-2' /></NavLink>
                        </div>
                        : ''}

                        {this.props.user.user ? <div id='bottombar-notification-button'>
                            <FontAwesomeIcon icon={faBell} size='2x' onClick={(e) => this.showNotificationPanel(e)} className={`mr-2 ${this.props.menu.id === 'notification-panel' && this.props.menu.show ? 'text-highlight' : ''}`} />
                            {parseInt(this.props.user.notifications) > 0 ? <span id='bottombar-notification-counter' className='mini-badge mini-badge-danger'>{this.props.user.notifications}</span> : ''}
                        </div> : ''}

                        <NotificationPanel show={this.props.menu.id === 'notification-panel' && this.props.menu.show} />
                    </div>

                    <div id='bottombar-toggle-button'>
                        {(parseInt(this.props.user.estimates) > 0 || parseInt(this.props.user.messages) > 0 || parseInt(this.props.user.proposals) > 0) && !this.state.showMenu ? <div className='bottombar-message-indicator'></div> : ''}
                        <FontAwesomeIcon icon={this.state.showBottomBar ? faTimes : faBars} size='2x' onClick={() => this.toggleMenu()} />
                    </div>
                </div> : ''}
            </div>
        );
    }
}

BottomBar.propTypes = {
    user: PropTypes.object,
    items: PropTypes.array
};

const mapStateToProps = state => {
    return {
        config: state.Config,
        sectors: state.Sectors.sectors,
        menu: state.Menu
    }
}

export default withRouter(connect(mapStateToProps)(BottomBar));