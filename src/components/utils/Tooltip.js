import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Tooltip extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            show: false
        }
    }
    
    render() {
        let tooltip;
        
        if (!this.props.hide && this.state.show) {
            tooltip = <div className={`tooltip ${!this.props.placement ? 'top' : this.props.placement}`}>{this.props.text}</div>;
        }

        return (
            <div className={`tooltip-container ${this.props.className ? this.props.className : ''}`}>
                {tooltip}
                <div onMouseOver={() => this.setState({show: true})} onMouseOut={() => this.setState({show: false})}>{this.props.children}</div>
            </div>
        );
    }
}

Tooltip.propTypes = {

};

export default Tooltip;