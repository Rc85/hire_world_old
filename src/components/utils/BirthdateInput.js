import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputWrapper from './InputWrapper';

class BirthdateInput extends Component {
    render() {
        let beginningYear = 1900;
        let currentYear = new Date().getFullYear();
        let yearsToAdd = parseInt(currentYear) - beginningYear - 19;
        let year = [];

        for (let i = 0; i < yearsToAdd; i++) {
            let y = beginningYear + i;
            year.push(y);
        }

        let years = year.map((y, i) => {
            return <option key={i} value={y}>{y}</option>
        });

        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let months = month.map((m, i) => {
            return <option key={i} value={i + 1}>{m}</option>
        });

        let day = [];
        let numOfDays = 0;

        if (this.props.month === 1 || this.props.month === 3 || this.props.month === 5 || this.props.month === 7 || this.props.month === 8 || this.props.month === 10 || this.props.month === 12) {
            numOfDays = 31;
        } else if (this.props.month === 4 || this.props.month === 6 || this.props.month === 9 || this.props.month === 11) {
            numOfDays = 30;
        } else if (this.props.month === 2) {
            if (this.props.year) {
                if (parseInt(this.props.year) % 4 === 0) {
                    numOfDays = 29;
                } else {
                    numOfDays = 28;
                }
            }
        }

        for (let i = 0; i < numOfDays; i++) {
            day.push(i + 1);
        }

        let days = day.map((d, i) => {
            return <option key={i} value={d}>{d}</option>
        });
        
        return (
            <div className='birthdate-input'>
                <InputWrapper label='Date of Birth' required={this.props.required}>
                    <select value={this.props.year === null ? '' : this.props.year} onChange={(e) => {this.props.setYear(parseInt(e.target.value))}} required={this.props.required}>
                        <option value='' disabled>Year</option>
                        {years.reverse()}
                    </select>

                    <select value={this.props.month === null ? '' : this.props.month} onChange={(e) => {this.props.setMonth(parseInt(e.target.value))}} required={this.props.required}>
                        <option value='' disabled>Month</option>
                        {months}
                    </select>

                    <select value={this.props.day === null ? '' : this.props.day} onChange={(e) => {this.props.setDay(parseInt(e.target.value))}} required={this.props.required}>
                        <option value='' disabled>Day</option>
                        {days}
                    </select>
                </InputWrapper>
            </div>
        );
    }
}

BirthdateInput.propTypes = {

};

export default BirthdateInput;