import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/pro-solid-svg-icons';

class TitledContainer extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            minimize: this.props.minimized
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.minimized !== this.props.minimized) {
            this.setState({minimize: this.props.minimized});
        }
    }
    
    render() {
        return(
            <div id={this.props.id} className={`titled-container ${this.props.shadow ? 'with-shadow' : ''} ${this.props.className ? this.props.className : ''} ${this.props.mini ? 'mini' : ''} ${this.props.borderColor ? this.props.borderColor: ''}`}>
                <div className='title-wrapper'>
                    {this.props.mini ? '' : <div className='titled-container-icon'>{this.props.icon}</div>}
                    <h3 className={`bg-${this.props.bgColor ? this.props.bgColor : 'highlight'} ${this.props.textColor ? `text-${this.props.textColor}` : ''}`}>{this.props.title}</h3>
                    {this.props.secondaryTitle ? <h3 className='bg-grey'>{this.props.secondaryTitle}</h3> : ''}
                </div>

                {this.props.minimizable ? <button className='title-container-toggle-button btn btn-info' onClick={() => this.setState({minimize: !this.state.minimize})}><FontAwesomeIcon icon={this.state.minimize ? faCaretDown : faCaretUp} /></button> : ''}

                <div className={`${this.props.contentClassName ? this.props.contentClassName : ''} ${this.props.scroll ? 'with-scroll' : 'no-scroll'} ${this.state.minimize ? 'minimized' : ''}`}>{this.props.children}</div>
            </div>
        )
    }
}

TitledContainer.propTypes = {
    title: PropTypes.string,
    bgColor: PropTypes.string,
    textColor: PropTypes.string,
    shadow: PropTypes.bool
};

export default TitledContainer;