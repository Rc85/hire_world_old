import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class TabBar extends Component {
    render() {
        return(
            <div className='tab-bar'>
                <NavLink to='/admin/overview'><div className={this.props.active === 'overview' ? 'tab-button active' : 'tab-button'}>Overview</div></NavLink>
                <NavLink to='/admin/categories'><div className={this.props.active === 'categories' ? 'tab-button active' : 'tab-button'}>Categories</div></NavLink>
            </div>
        )
    }
}

export default TabBar;