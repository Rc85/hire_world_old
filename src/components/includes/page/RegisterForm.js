import React, { Component } from 'react';
import { connect } from 'react-redux';
import SubmitButton from '../../utils/SubmitButton';
import { withRouter } from 'react-router-dom';
import { RegisterUser } from '../../../actions/RegisterActions';
import { Button } from 'reactstrap';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import Alert from '../../utils/Alert';

class RegisterForm extends Component {
    constructor() {
        super();

        this.state = {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            confirmEmail: '',
            firstName: '',
            lastName: '',
            businessName: '',
            country: '',
            region: '',
            city: '',
            agreed: false
        }
    }
    
    handleRegister() {
        this.props.dispatch(RegisterUser(this.state));
    }

    render() {
        let error;
        let success = /success$/;
        let fail = /(fail|error)$/;

        if (fail.test(this.props.status)) {
            error = <Alert status='error' />
        } else if (this.props.status && !fail.test(this.props.status) && !success.test(this.props.status) && this.props.status !== 'loading') {
            error = <Alert status='error' message={this.props.status} />
        }

        return(
            <section id='register-form' className='main-panel'>
                <div className='blue-panel shallow rounded w-100'>
                    {error}
                    <h2>Register</h2>
                    
                    <div className='form-row mb-3'>
                        <label htmlFor='reg-username'>Username: </label>
                        <input className='form-control' type='text' name='username' id='reg-username' required onChange={(e) => this.setState({username: e.target.value})} placeholder='5-15 alpha-numeric, dash, and underscore' minLength='3' maxLength='15' />
                    </div>

                    <div className='form-row mb-3'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-password'>Password: </label></div>
                            <input className='form-control' type='password' name='password' id='reg-password' required onChange={(e) => this.setState({password: e.target.value})} placeholder='6-20 characters' minLength='6' maxLength='20' />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-confirm-password'>Confirm Password: </label></div>
                            <input className='form-control' type='password' name='confirm_password' id='reg-confirm-password' required onChange={(e) => this.setState({confirmPassword: e.target.value})} minLength='6' maxLength='20' />
                        </div>
                    </div>

                    <div className='form-row mb-3'>
                        <div className='w-45'>
                            <div><label htmlFor='reg-email'>Email: </label></div>
                            <input className='form-control' type='email' name='email' id='reg-email' required onChange={(e) => this.setState({email: e.target.value})} />
                        </div>

                        <div className='w-45'>
                            <div><label htmlFor='reg-confirm-email'>Confirm Email: </label></div>
                            <input className='form-control' type='email' name='confirm_email' id='reg-confirm-email' required onChange={(e) => this.setState({confirmEmail: e.target.value})} />
                        </div>
                    </div>

                    <h5>Optional</h5>

                    <hr/>

                    <div className='form-row mb-3'>
                        <div className='form-col w-45'>
                            <div className='mb-3'>
                                <div><label htmlFor='reg-fname'>First Name: </label></div>
                                <input className='form-control' type='text' name='fname' id='reg-fname' onChange={(e) => this.setState({firstName: e.target.value})} />
                            </div>

                            <div className='mb-3'>
                                <div><label htmlFor='reg-lname'>Last Name: </label></div>
                                <input className='form-control' type='text' name='lname' id='reg-lname' onChange={(e) => this.setState({lastName: e.target.value})} />
                            </div>

                            <div className='mb-3'>
                                <div><label htmlFor='reg-bname'>Business Name: </label></div>
                                <input className='form-control' type='text' name='bname' id='reg-bname' onChange={(e) => this.setState({businessName: e.target.value})} />
                            </div>
                        </div>

                        <div className='form-col w-45'>
                            <div className='mb-3'>
                                <div><label htmlFor='reg-country'>Country: </label></div>
                                <CountryDropdown classes='form-control' value={this.state.country} onChange={(val) => this.setState({country: val})} />
                            </div>

                            <div className='mb-3'>
                                <div><label htmlFor='reg-region'>Region:</label></div>
                                <RegionDropdown classes='form-control' value={this.state.region} country={this.state.country} onChange={(val) => this.setState({region: val})} />
                            </div>

                            <div className='mb-3'>
                                <div><label htmlFor='reg-city'>City: </label></div>
                                <input className='form-control' type='text' name='lname' id='reg-city' onChange={(e) => this.setState({city: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <input type='checkbox' name='agree' id='reg-agree'  onChange={() => this.setState({agreed: !this.state.agree})} /> <label className='form-check-label' htmlFor='reg-agree'>I read, understand, and agree with the terms of service.</label>
                    </div>
                    

                    <div className='text-right'>
                        <SubmitButton type='submit' loading={this.props.status ? this.props.status : ''} value='Submit' onClick={() => this.handleRegister()}/>

                        <Button type='button' color='secondary' disabled={this.props.status === 'loading' ? true : false} onClick={() => {
                            this.setState({
                                username: null,
                                password: null,
                                confirmPassword: null,
                                email: null,
                                confirmEmail: null
                            });
                        }}>
                            Clear
                        </Button>
                    </div>
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Register.status
    }
}

export default withRouter(connect(mapStateToProps)(RegisterForm));