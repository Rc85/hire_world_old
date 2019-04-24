import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { ToggleMenu } from '../../../actions/MenuActions';

class BrowseMenu extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            type: null
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.key !== this.props.location.key) {
            this.props.dispatch(ToggleMenu(false, ''));
        }

        if (prevProps.menu.id !== this.props.menu.id && this.props.menu.id !== 'browse-menu') {
            this.setState({type: null});
        }
    }
    
    openSectorMenu(e, type) {
        e.stopPropagation();

        if (this.state.type !== type) {
            this.setState({type: type});
        } else {
            this.setState({type: null});
        }
    }
    
    render() {
        return(
            <div id='browse-menu' className={this.props.show ? 'show' : ''}>
                <div className='browse-menu-container'>
                    <div className='browse-category-container'>
                        <div className='browse-menu-item' onClick={(e) => this.openSectorMenu(e, 'jobs')}>
                            <div className={`browse-sectors-container ${this.state.type === 'jobs' ? 'expand' : ''}`}>
                                <div className='browse-menu-item-container'>
                                    {this.props.sectors.map((sector, i) => {
                                    return <NavLink key={i} className={`browse-menu-item`} to={`/sectors/${this.state.type}/${sector.sector}`} id={`${sector.sector}-link`}>{sector.sector}</NavLink>})}
                                </div>
                            </div>

                            <span>Jobs</span>
                        </div>

                        <div className='browse-menu-item' onClick={(e) => this.openSectorMenu(e, 'profiles')}>
                            <div className={`browse-sectors-container ${this.state.type === 'profiles' ? 'expand' : ''}`}>
                                <div className='browse-menu-item-container'>
                                    {this.props.sectors.map((sector, i) => {
                                    return <NavLink key={i} className={`browse-menu-item`} to={`/sectors/${this.state.type}/${sector.sector}`} id={`${sector.sector}-link`}>{sector.sector}</NavLink>})}
                                </div>
                            </div>

                            <span>Profiles</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors,
        menu: state.Menu
    }
}

export default withRouter(connect(mapStateToProps)(BrowseMenu));