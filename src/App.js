import React, { Component } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import { Route, withRouter, Switch } from 'react-router-dom';
import Main from './components/Main';
import ViewUser from './components/ViewUser';
import BrowseMenu from './components/BrowseMenu';
import Dashboard from './components/Dashboard';
import { connect } from 'react-redux';
import { GetSession, GetCategories } from './actions/FetchActions';
import Overview from './components/admin/Overview';
import Categories from './components/admin/Categories';
import Response from './components/Response';
import { CloseMenus } from './actions/TogglerActions';
import Register from './components/Register';
import Login from './components/Login';

class App extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.dispatch(GetSession());
		this.props.dispatch(GetCategories());

		document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
			if (typeof e.target.className === 'object' || e.target.className === 'main-menu-item' || e.target.className === 'menu-item') {
				return;
			} else {
				this.props.dispatch(CloseMenus());
			}
		});
    }

	render() {
		return (
			<div className='col-container'>
				<TopBar />

				<section className='main-container'>
					<Switch>
						<Route exact path='/' component={Main} />
						<Route exact path='/view' component={ViewUser} />
						<Route exact path='/dashboard' component={Dashboard} />
						<Route exact path='/admin/overview' component={Overview} />
						<Route exact path='/admin/categories' component={Categories} />
						<Route exact path='/account/login' component={Login} />
						<Route exact path='/account/register' component={Register} />
						<Route render={() => <Response code={404} header={'Not Found'} message={`This page you're trying to access does not exist.`} />} />
					</Switch>

					<BrowseMenu />
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.Login.user
	}
}

export default withRouter(connect(mapStateToProps)(App));
