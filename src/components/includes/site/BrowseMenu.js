import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

class BrowseMenu extends Component {
    render() {
        return(
            <div id='browse-menu' className={this.props.show ? 'show' : ''}>
                {this.props.sectors.map((sector, i) => {
                return <NavLink key={i} className={`browse-menu-item ${this.props.location.pathname === `/sectors/${sector.sector}` ? 'active' : ''}`} to={`/sectors/${sector.sector}`} id={`${sector.sector}-link`}>{sector.sector}</NavLink>})}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(BrowseMenu));