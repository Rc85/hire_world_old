import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle as faCircleSelected } from '@fortawesome/pro-solid-svg-icons';
import { faCircle } from '@fortawesome/pro-regular-svg-icons';
import InputWrapper from './InputWrapper';
import { ResetSelection, SubmitSelection } from '../../actions/SelectModalActions';
import { connect } from 'react-redux';

class SelectionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: '',
            specified: ''
        }
    }

    componentDidMount() {
        document.body.style.overflowY = 'hidden';
    }

    componentWillUnmount() {
        document.body.style.overflowY = '';
    }
    
    select(selection) {
        if (this.state.selected === selection) {
            this.setState({selected: ''});
        } else {
            this.setState({selected: selection});
        }
    }

    render() {
        return (
            <div id='selection-modal-container' style={{top: `${window.pageYOffset}px`, left: '0'}} className='full-black-overlay'>
                <div className='modal-container global-loading-container'>
                    <div className='mb-3'>{this.props.text}</div>

                    <div className='choices-container mb-3'>
                        {this.props.selections.map((selection, i) => {
                            return <div key={selection} className='selection-choice'>
                                <FontAwesomeIcon icon={this.state.selected === selection ? faCircleSelected : faCircle} className={`${this.state.selected === selection ? 'text-success' : 'text-grey'} mr-2`} onClick={() => this.select(selection)} /> {selection}
                            </div>
                        })}
                        <div className='selection-choice'>
                            <FontAwesomeIcon icon={this.state.selected === 'Other' ? faCircleSelected : faCircle} className={`${this.state.selected === 'Other' ? 'text-success' : 'text-grey'} mr-2`} onClick={() => this.select('Other')} /> Other
                        </div>
                    </div>

                    {this.state.selected === 'Other'
                        ? <InputWrapper label='Specify' className='mb-3'>
                            <input type='text' onChange={(e) => this.setState({specified: e.target.value})} />
                        </InputWrapper>
                        : ''
                    }

                    <div className='text-right'>
                        <button className='btn btn-primary' type='button' onClick={() => this.props.dispatch(SubmitSelection(this.state.selected, this.state.specified))}>Submit</button>
                        <button className='btn btn-secondary' type='button' onClick={() => this.props.dispatch(ResetSelection())}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }
}

SelectionModal.propTypes = {
    text: PropTypes.string,
    selections: PropTypes.array
};

export default connect()(SelectionModal);