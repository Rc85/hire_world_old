import React, { Component } from 'react';
import PropTypes from 'prop-types';

let sliderContainer, slider, sliderCheckbox;

/**
 * @param {String} status The current status of the toggler
 * @param {String} inactiveColor The background color when the toggler is inactive
 * @param {Function} onClick The onClick event
 * @param id A unique identifier for the toggler
 */
class SlideToggle extends Component {
    componentDidMount() {
        if (this.props.status) {
            sliderContainer.style.background = '#14FF14';
            slider.style.left = '3px';
        } else {
            sliderContainer.style.background = this.props.inactiveColor;
            slider.style.left = 'calc(50% - 4px)';
        }
    }

    componentDidUpdate() {
        if (this.props.status) {
            sliderContainer.style.background = '#14FF14';
            slider.style.left = '3px';
            sliderCheckbox.checked = true;
        } else {
            sliderContainer.style.background = this.props.inactiveColor;
            slider.style.left = 'calc(50% - 4px)';
            sliderCheckbox.checked = false;
        }
    }

    click() {
        if (typeof this.props.timer === 'number' && this.props.timer >= 0) {
            return;
        } else {
            this.props.onClick();
        }
    }

    render() {
        return(
            <div ref={node => {sliderContainer = node}} className={`slider-container ${this.props.className ? this.props.className : ''}`}>
                {typeof this.props.timer === 'number' ? <div className='slider-timeout'></div> : ''}
                <div ref={node => {slider = node}} className='slider' onClick={() => this.click()}>
                    <input ref={node => {sliderCheckbox = node}} className='slider-checkbox' type='checkbox' id={this.props.id} defaultChecked={this.props.status} />
                </div>
            </div>
        )
    }
}

SlideToggle.defaultProps = {
    status: false,
    inactiveColor: '#C4C4C4',
}

SlideToggle.propTypes = {
    status: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    inactiveColor: PropTypes.string,
    id: PropTypes.string
}

export default SlideToggle;