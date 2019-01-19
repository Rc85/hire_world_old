import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faSignOutAlt, faThList, faTimes, faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { LogoutUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import LoginPanel from './LoginPanel';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import NotificationPanel from './NotificationPanel';
import { ToggleMenu } from '../../../actions/MenuActions';

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

        let browseLink = <div className='bottombar-item'>
            <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'><FontAwesomeIcon icon={faThList} /></div><strong onClick={() => this.setState({showSectors: true})}>Browse Listings</strong></div>
        </div>;

        if (this.props.user.user) {
            bottombarContent = <React.Fragment>
                {this.props.items.map((item, i) => {
                    return <div key={i} className='bottombar-item'>
                        <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'>{item.icon}</div><NavLink to={item.link}>{item.name}</NavLink></div>

                        <div className='bottombar-sub-item-container'>
                            {item.items ? item.items.map((subItem, index) => {
                                return <div key={index} className='bottombar-sub-item'><NavLink to={subItem.link}>{subItem.name}</NavLink></div>
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
            bottombarContent = <LoginPanel />;
        }

        return (
            <div id='bottombar-container' className={`${this.props.config.isTyping ? 'hide' : ''}`}>
                <div id='bottombar' className={!this.state.showMenu ? '' : 'expand'}>
                    <div className={`bottombar-item-container`}>
                        {browseLink}
                        {bottombarContent}
                    </div>

                    <div id='bottombar-sectors-container' className={this.state.showSectors ? 'show' : ''}>
                        <div id='bottombar-sectors'>
                            <div className='text-right'><FontAwesomeIcon icon={faTimes} id='bottombar-sectors-close-button' size='lg' onClick={() => this.setState({showSectors: false, showMenu: true})} /></div>

                            {this.props.sectors.map((sector, i) => {
                                return <div key={i}><NavLink to={`/sectors/${sector.sector}`}>{sector.sector}</NavLink></div>
                            })}
                        </div>
                    </div>
                </div>
                
                <div className='bottombar-toggle-buttons'>
                    <div id='bottombar-button-container'>
                        <FontAwesomeIcon icon={faBell} size='2x' className='mr-2' onClick={(e) => this.showNotificationPanel(e)} />
                        <a href='/faq'><FontAwesomeIcon icon={faQuestionCircle} size='2x' /></a>
                        <NotificationPanel show={this.props.menu.id === 'notification-panel' && this.props.menu.show} />
                    </div>

                    <FontAwesomeIcon icon={this.state.showBottomBar ? faTimes : faBars} size='2x' onClick={() => this.toggleMenu()} id='bottombar-toggle-button' />
                </div>
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