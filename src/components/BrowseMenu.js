import React, { Component } from 'react';
import '../styles/BrowseMenu.css';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class BrowseMenu extends Component {
    render() {
        let position;
        let categories;
        
        if (this.props.categories) {
            categories = this.props.categories.map((category, i) => {
                return <a key={i} className='main-menu-item' href={`/${category.category.toLowerCase()}`} id={`${category.category}-link`}>{category.category}</a>
            });
        }

        if (this.props.menu === 'main-menu' && this.props.status) {
            position = {right: '0'}
        } else {
            position = {right: '-15%'}
        }

        return(
            <div id='browse-menu' style={position}>
                {categories}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        menu: state.ToggleMenu.menu,
        status: state.ToggleMenu.status,
        categories: state.Categories.categories
    }
}

export default withRouter(connect(mapStateToProps)(BrowseMenu));