import React, { Component } from 'react';
import { Button } from 'reactstrap';

class InputText extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        }
    }

    render() {
        return(
            <div className='d-flex'>
                <input className='form-control mr-1' type='text' name='text' value={this.state.value}
                onChange={(e) => {
                    this.setState({value: e.target.value});
                }}
                onKeyDown={(e) => {
                    if (e.keyCode === 13) { this.props.submitCallback(this.state.value); }
                }} />
                <Button color='secondary' onClick={(e) => {
                    e.stopPropagation();

                    this.props.cancelCallback();
                }}>Cancel</Button>
            </div>
        )
    }
}

export default InputText;