import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faSignOutAlt, faThList, faTimes } from '@fortawesome/free-solid-svg-icons';
import { LogoutUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';
import LoginPanel from './LoginPanel';

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
        if (prevProps.location.key !== this.props.location.key) {
            this.toggleMenu(true);
        }
    }
    
    toggleMenu(forceClose) {
        let showBottomBar = !this.state.showBottomBar;

        if (forceClose) {
            showBottomBar = false;
        } else {
            if (!this.state.showBottomBar) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
        
        this.setState({showBottomBar: showBottomBar, showMenu: true, showSectors: false});
    }
    
    render() {
        let bottombarContent;

        let browseLink = <div className='bottombar-item'>
            <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'><FontAwesomeIcon icon={faThList} /></div><strong onClick={() => this.setState({showSectors: true, showMenu: false})}>Browse Listings</strong></div>
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
            <div id='bottombar-container' className={`${this.state.showBottomBar ? 'expand' : ''} ${this.props.config.isTyping ? 'hide' : ''}`}>
                <div className='bottombar-toggle-button'><FontAwesomeIcon icon={this.state.showBottomBar ? faChevronDown : faChevronUp} size='3x' onClick={() => this.toggleMenu()} /></div>

                <div id='bottombar'>
                    <div className={`bottombar-item-container ${!this.state.showMenu ? 'hide' : ''}`}>
                        {browseLink}
                        {bottombarContent}
                    </div>

                    <div id='bottombar-sectors-container' className={this.state.showSectors ? 'show' : ''}>
                        <div className='text-right'><FontAwesomeIcon icon={faTimes} id='bottombar-sectors-close-button' size='lg' onClick={() => this.setState({showSectors: false, showMenu: true})} /></div>

                        <div id='bottombar-sectors'>
                            {this.props.sectors.map((sector, i) => {
                                return <div key={i}><NavLink to={`/sectors/${sector.sector}`}>{sector.sector}</NavLink></div>
                            })}
                        </div>
                    </div>
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
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(BottomBar));