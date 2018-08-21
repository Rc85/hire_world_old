import React, { Component } from 'react';
import '../styles/LoginRegister.css';
import Register from './Register';
import Login from './Login';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class LoginRegister extends Component {
    constructor(props) {
        super(props);

        this.toggleTab = this.toggleTab.bind(this);

        this.state = {
            tab: this.props.tab
        }
    }

    componentWillReceiveProps(props, nextProps) {
        console.log(props)
        console.log(nextProps)
    }

    toggleTab(tab) {
        this.setState({tab: tab});
    }

    render() {
        return(
            <section id='login-register' className='main-panel'>
                <div className='mx-auto'>
                    <div className='tab-container'>
                        <div onClick={() => this.toggleTab('login')} className={this.state.tab === 'login' ? 'tab-button active' : 'tab-button'}>Login</div>
                        <div onClick={() => this.toggleTab('register')} className={this.state.tab === 'register' ? 'tab-button active' : 'tab-button'}>Register</div>
                    </div>
                    
                    <Login show={this.state.tab === 'login'} />
                    <Register show={this.state.tab === 'register'} />
                </div>
            </section>
        )
    }
}

export default withRouter(connect()(LoginRegister));