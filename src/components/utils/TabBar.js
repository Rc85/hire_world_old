import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

export default class TabBar extends Component {
    render() {
        let items = this.props.items.map((item, i) => {
            return <NavLink key={i} to={item.link}><div className={item.active ? 'tab-button active' : 'tab-button'}>{item.name}</div></NavLink>
        });

        return(
            <div className='tab-bar'>
                {items}
            </div>
        )
    }
}

TabBar.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            active: PropTypes.bool.isRequired,
            link: PropTypes.string
        }).isRequired
    ).isRequired
}