import React, { Component } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import { Route, withRouter } from 'react-router-dom';
import Main from './components/Main';
import ViewUser from './components/ViewUser';
import EmployMenu from './components/EmployMenu';
import Dashboard from './components/Dashboard';
import { connect } from 'react-redux';
import { GetSession } from './actions/EditUserActions';

class App extends Component {
	constructor(props) {
		super(props);
	}

	static defaultProps() {
		return {
			menuState: null
		}
	}

	componentDidMount() {
        this.props.dispatch(GetSession());
    }

	render() {
		return (
			<div className='col-container'>
				<TopBar />

				<section className='main-container'>
					<Route exact path='/' component={Main} />
					<Route exact path='/view' component={ViewUser} />
					<Route exact path='/dashboard' component={Dashboard} />

					<EmployMenu show={this.props.menuState} />
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		menuState: state.ToggleMenu.main_menu,
		user: state.Login.user
	}
}

export default withRouter(connect(mapStateToProps)(App));
