import React, { Component } from 'react';
import PropTypes from 'prop-types';

/** A text area component with its own state, submit button and cancel button
 * @param {String} [value] A default value for cases where the text area needs to be edited
 * @param {Function} submit The function when submit is clicked
 * @param {Function} cancel The function when cancel is clicked
 */
class TextArea extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value || ''
        }
    }

    render() {
        return(
            <div>
                <textarea className='form-control w-100 mb-1' rows='6' defaultValue={this.props.value} onChange={(e) => this.setState({value: e.target.value})}></textarea>

                <div className='text-right'>
                    <SubmitButton type='button' value='Send' loading={this.props.status ? true : false} onClick={() => this.props.submit(this.state.value)} />
                    <button className='btn btn-secondary' onClick={() => this.props.cancel()}>Cancel</button>
                </div>
            </div>
        )
    }
}

TextArea.propTypes = {
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    value: PropTypes.string
}

export default TextArea;