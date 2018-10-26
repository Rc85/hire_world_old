import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';

class Menu extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            submenu: null
        }
    }
    
    render() {
        let menu;

        if (this.props.items instanceof Array) {
            let items = this.props.items.map((item, i) => {
                return <div key={i} className='menu-item' onClick={() => this.props.onClick(item)}>{item}</div>
            });
            menu = <div className='menu mt-1'>{items}</div>;
        } else {
            let headers = [];
            let subMenuItems = [];
            let subMenus = [];

            for (let header in this.props.items) {
                headers.push(header);
                subMenuItems.push(this.props.items[header]);
            }

            for (let items of subMenuItems) {
                let menu = items.map((item, i) => {
                    return <div key={i} className='menu-item' onClick={() => this.props.onClick(item)}>{item}</div>
                });

                subMenus.push(menu);
            }

            let mainMenu = headers.map((header, i) => {
                return <div key={i} className='menu-item d-flex-between-center position-relative' onMouseEnter={() => this.setState({submenu: i})}>
                    <div key={i} className='w-100 d-flex-between-center'>
                        <div className='mr-5'>{header}</div>
                        <FontAwesomeIcon icon={faCaretRight} />
                    </div>

                    <div className='submenu'>{this.state.submenu === i ? subMenus[i] : ''}</div>
                </div>
            });

            menu = <div className='menu mt-1 d-flex'>
                <div>{mainMenu}</div>
            </div>
        }

        if (this.props.open) {
            return(
                <React.Fragment>{menu}</React.Fragment>
            );
        }

        return null;
    }
}

Menu.propTypes = {
    open: PropTypes.bool.isRequired,
    items: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]).isRequired
}

export default connect()(Menu);