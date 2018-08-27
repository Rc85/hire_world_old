import React, { Component } from 'react';
import TopBar from './components/includes/site/TopBar';
import { Route, withRouter, Switch } from 'react-router-dom';
import Main from './components/pages/Main';
import ViewUser from './components/pages/ViewUser';
import BrowseMenu from './components/includes/site/BrowseMenu';
import Dashboard from './components/pages/Dashboard';
import { connect } from 'react-redux';
import { GetSession, GetSectors } from './actions/FetchActions';
import AdminOverview from './components/admin/AdminOverview';
import AdminSectors from './components/admin/AdminSectors';
import Response from './components/pages/Response';
import { CloseMenus } from './actions/TogglerActions';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import Confirmation from './components/utils/Confirmation';
import Sectors from './components/pages/Sectors';
import EditUser from './components/includes/page/EditUser';
import Admin from './components/admin/Admin';
import UserSettings from './components/pages/UserSettings';

class App extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.dispatch(GetSession());
		this.props.dispatch(GetSectors());

		document.body.addEventListener('click', (e) => {
			if (typeof e.target.className === 'object' || e.target.className === 'main-menu-item' || e.target.className === 'menu-item') {
				return;
			} else {
				this.props.dispatch(CloseMenus());
			}
		});
    }

	render() {
		let confirmation, sectors;

		if (this.props.confirmation.status === true) {
			confirmation = <Confirmation message={this.props.confirmation.message} note={this.props.confirmation.note} />
		}

		if (this.props.sectors) {
			sectors = this.props.sectors.map((sector, i) => {
				return <Route key={i} path={`/sectors/${sector.sector.toLowerCase()}`} render={() => <Sectors name={sector.sector} />} />;
			});
		}

		return (
			<div className='col-container'>
				{confirmation}
				<TopBar />

				<section className='main-container'>
					<Switch>
						<Route exact path='/' component={Main} />
						<Route exact path='/view' component={ViewUser} />
						<Route exact path='/dashboard/edit' render={() => <Dashboard child={<EditUser />} />} />
						<Route exact path='/dashboard/settings' render={() => <Dashboard child={<UserSettings />} />} />
						<Route exact path='/admin/overview' render={() => <Admin child={<AdminOverview />} />} />
						<Route exact path='/admin/sectors' render={() => <Admin child={<AdminSectors />} />} />
						<Route exact path='/account/login' component={Login} />
						<Route exact path='/account/register' component={Register} />
						{sectors}
						<Route exact path='/sectors/:sector' component={Sectors} />
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
		user: state.Login.user,
		confirmation: state.Confirmation,
		sectors: state.Sectors.sectors
	}
}

export default withRouter(connect(mapStateToProps)(App));
