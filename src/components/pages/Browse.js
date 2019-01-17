import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, NavLink } from 'react-router-dom';
import { GetSectors } from '../../actions/FetchActions';

class Browse extends Component {
    componentDidMount() {
        this.props.dispatch(GetSectors());
    }
    
    render() {
        return(
            <section id='browse'>
                <div id='browse-list-container'>
                    <div id='browse-list'>
                        {this.props.sectors.map((sector, i) => {
                            return <div key={i} className='sector-container'>
                                {sector.sector}
                            </div>
                        })}
                    </div>
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        sectors: state.Sectors.sectors
    }
}

export default withRouter(connect(mapStateToProps)(Browse));