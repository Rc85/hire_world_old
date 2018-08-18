import React, { Component } from 'react';
import '../styles/Main.css';
import Register from './Register';
import Login from './Login';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

class Main extends Component {
    constructor(props) {
        super(props);

        this.toggleTab = this.toggleTab.bind(this);

        this.state = {
            tab: 'login'
        }
    }

    toggleTab(tab) {
        this.setState({tab: tab});
    }

    render() {
        if (this.props.user) {
            return(
                <Dashboard />
            )
        } else {
            return(
                <section id='main'>
                    <div className='w-25 mx-auto'>
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
}

const mapStateToProps = state => {
    return {
        user: state.Login.user
    }
}

export default withRouter(connect(mapStateToProps)(Main));