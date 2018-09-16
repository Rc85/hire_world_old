import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { GetSession, GetSectors } from './actions/FetchActions';
import AdminOverview from './components/admin/AdminOverview';
import AdminSectors from './components/admin/AdminSectors';
import Admin from './components/admin/Admin';

/* import Browse from './components/pages/Browse';
import Dashboard from './components/pages/Dashboard';
import EditUser from './components/pages/EditUser';
import Login from './components/pages/Login';
import Main from './components/pages/Main';
import MessageDetails from './components/pages/MessageDetails';
import Messages from './components/pages/Messages';
import Register from './components/pages/Register';
import Response from './components/pages/Response';
import Sectors from './components/pages/Sectors';
import ServiceDetails from './components/pages/ServiceDetails';
import UserSettings from './components/pages/UserSettings';
import ViewUser from './components/pages/ViewUser'; */

import * as Pages from './components/pages';

import TopBar from './components/includes/site/TopBar';
import BrowseMenu from './components/includes/site/BrowseMenu';
import Confirmation from './components/utils/Confirmation';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mainMenu: false
		}
	}

	componentDidMount() {
		this.props.dispatch(GetSession());
		this.props.dispatch(GetSectors());

		document.body.addEventListener('click', (e) => {
			if (typeof e.target.className === 'object' || e.target.className === 'main-menu-item' || e.target.className === 'menu-item' || e.target.id === 'browse-menu-button') {
				return;
			} else {
				if (this.state.mainMenu) {
					this.setState({mainMenu: false});
				}
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
				return <Route key={i} path={`/sectors/${sector.sector.toLowerCase()}`} render={() => <Pages.Sectors name={sector.sector} />} />;
			});
		}

		if (this.state.mainMenu) {
			this.menu = <BrowseMenu unmount={false} />
		} else {
			this.menu = <BrowseMenu unmount={true} />
		}

		return (
			<div className='col-container'>
				{confirmation}
				<TopBar toggleMenu={() => this.setState({mainMenu: !this.state.mainMenu})} />

				<div className='position-relative'>{this.menu}</div>

				<section className='main-container'>
					<Switch>
						<Route exact path='/' component={Pages.Main} />
						<Route exact path='/view' component={Pages.ViewUser} />
						<Route exact path='/dashboard/listings' render={() => <Pages.Dashboard user={this.props.user}><Pages.UserServices user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/edit' render={() => <Pages.Dashboard user={this.props.user}><Pages.EditUser user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/settings' render={() => <Pages.Dashboard user={this.props.user}><Pages.UserSettings user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/messages/:stage' render={() => <Pages.Dashboard user={this.props.user}><Pages.Messages user={this.props.user} /></Pages.Dashboard>} />} />
						<Route exact path='/dashboard/message/:stage/:id/details' render={() => <Pages.Dashboard user={this.props.user}><Pages.MessageDetails user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/admin/overview' render={() => <Admin child={<AdminOverview />} />} />
						<Route exact path='/admin/sectors' render={() => <Admin child={<AdminSectors />} />} />
						<Route exact path='/service/:id' render={() => <Pages.ServiceDetails user={this.props.user} />} />
						<Route exact path='/user/:username' render={() => <Pages.ViewUser user={this.props.user} />} />
						<Route exact path='/account/login' render={() => <Pages.Login user={this.props.user} />} />
						<Route exact path='/account/register' render={() => <Pages.Register user={this.props.uer} />} />
						{sectors}
						<Route exact path='/sectors/:sector' component={Pages.Sectors} />
						<Route render={() => <Pages.Response code={404} header={'Not Found'} message={`This page you're trying to access does not exist.`} />} />
					</Switch>
				</section>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.Login,
		confirmation: state.Confirmation,
		sectors: state.Sectors.sectors,
		menu: state.ToggleMenu.menu,
        status: state.ToggleMenu.status,
	}
}

export default withRouter(connect(mapStateToProps)(App));
