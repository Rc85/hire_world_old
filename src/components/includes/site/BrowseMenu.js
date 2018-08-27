import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, NavLink } from 'react-router-dom';

class BrowseMenu extends Component {
    

    render() {
        let position;
        let sectors;
        
        if (this.props.sectors) {
            sectors = this.props.sectors.map((sector, i) => {
                return <NavLink key={i} className='main-menu-item' to={`/sectors/${sector.sector.toLowerCase()}`} id={`${sector.sector}-link`}>{sector.sector}</NavLink>
            });
        }

        if (this.props.menu === 'main-menu' && this.props.status) {
            
            position = {right: '0'}
        } else {
            position = {right: '-15%'}
        }

        return(
            <div id='browse-menu' style={position}>
                {sectors}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        menu: state.ToggleMenu.menu,
        status: state.ToggleMenu.status,
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(BrowseMenu));