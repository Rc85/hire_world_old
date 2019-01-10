import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { LogoutUser } from '../../../actions/LoginActions';
import { connect } from 'react-redux';

class BottomBar extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            showMenu: false
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            this.setState({showMenu: false});
        }
    }
    
    render() {
        return (
            <div id='bottombar-container' className={`${this.state.showMenu ? 'expand' : ''} ${this.props.config.isTyping ? 'hide' : ''}`}>
                <div className='bottombar-toggle-button' onClick={() => this.setState({showMenu: !this.state.showMenu})}><FontAwesomeIcon icon={this.state.showMenu ? faChevronDown : faChevronUp} size='3x' /></div>

                <div id='bottombar'>
                    <div className='bottombar-item-container'>
                        {this.props.items.map((item, i) => {
                            return <div key={i} className='bottombar-item'>
                                <div className='bottombar-item-wrapper'><div className='bottombar-item-icon'>{item.icon}</div> <div>{item.name}</div></div>
    
                                <div className='bottombar-sub-item-container'>
                                    {item.items.map((subItem, index) => {
                                        return <div key={index} className='bottombar-sub-item'><NavLink to={subItem.link}>{subItem.name}</NavLink></div>
                                    })}
                                </div>
                            </div>
                        })}

                        <div className='bottombar-item-wrapper mb-1' onClick={() => this.props.dispatch(LogoutUser())}>
                            <div className='bottombar-item-icon'><FontAwesomeIcon icon={faSignOutAlt} /></div>
                            <div>Logout</div>
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
        config: state.Config
    }
}

export default withRouter(connect(mapStateToProps)(BottomBar));