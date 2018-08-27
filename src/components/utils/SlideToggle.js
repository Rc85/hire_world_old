import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../../styles/SlideToggle.css';

let sliderContainer, slider, sliderCheckbox;

class SlideToggle extends Component {
    componentDidMount() {
        if (this.props.status === 'Active') {
            sliderContainer.style.background = '#14FF14';
            slider.style.left = '3px';
        } else {
            sliderContainer.style.background = this.props.inactiveColor;
            slider.style.left = 'calc(50% - 4px)';
        }
    }

    componentDidUpdate() {
        if (this.props.status === 'Active') {
            sliderContainer.style.background = '#14FF14';
            slider.style.left = '3px';
            sliderCheckbox.checked = true;
        } else if (this.props.status === 'Inactive') {
            sliderContainer.style.background = this.props.inactiveColor;
            slider.style.left = 'calc(50% - 4px)';
            sliderCheckbox.checked = false;
        }
    }

    render() {
        return(
            <div ref={node => {sliderContainer = node}} className='slider-container'>
                <div ref={node => {slider = node}} className='slider' onClick={() => this.props.onClick()}>
                    <input ref={node => {sliderCheckbox = node}} className='slider-checkbox' type='checkbox' id={this.props.id} defaultChecked={this.props.status === 'Active' ? true : false} />
                </div>
            </div>
        )
    }
}

SlideToggle.defaultProps = {
    inactiveColor: '#C4C4C4',
}

SlideToggle.propTypes = {
    status: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    inactiveColor: PropTypes.string
}

export default SlideToggle;