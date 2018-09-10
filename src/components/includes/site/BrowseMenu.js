import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

class BrowseMenu extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            right: '-15%',
            unmount: true
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.unmount) {
            this.setState({unmount: nextProps.unmount});

            setTimeout(() => {
                this.setState({right: '0'});
            }, 25);
        } else {
            this.setState({right: '-15%'});

            setTimeout(() => {
                this.setState({unmount: nextProps.unmount});
            }, 300);
        }
    }

    render() {
        let sectors;
        
        if (this.props.sectors) {
            sectors = this.props.sectors.map((sector, i) => {
                return <NavLink key={i} className='main-menu-item' to={`/sectors/${sector.sector}`} id={`${sector.sector}-link`}>{sector.sector}</NavLink>
            });
        }

        if (this.state.unmount) {
            return null
        } else {
            return(
                <div id='browse-menu' style={{right: this.state.right}}>
                    {sectors}
                </div>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default connect(mapStateToProps)(BrowseMenu);