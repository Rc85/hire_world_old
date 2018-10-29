import React, { Component } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { GetSession, GetSectors } from './actions/FetchActions';
import { RemoveAlert } from './actions/AlertActions';
import * as Pages from './components/pages';
import * as Admin from './components/admin';
import TopBar from './components/includes/site/TopBar';
import BrowseMenu from './components/includes/site/BrowseMenu';
import Confirmation from './components/utils/Confirmation';
import Alert from './components/utils/Alert';
import Prompt from './components/utils/Prompt';
import Warning from './components/utils/Warning';
import { ToggleMenu } from './actions/MenuActions';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mainMenu: false
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.location.key !== this.props.location.key) {
			this.props.dispatch(GetSession());
			this.props.dispatch(GetSectors());
		}
	}

	componentDidMount() {
		this.props.dispatch(GetSession());
		this.props.dispatch(GetSectors());

		document.body.addEventListener('click', (e) => {
			if (typeof e.target.className === 'object' || e.target.classList.contains('admin-menu-button') || e.target.classList.contains('menu-item') || e.target.classList.contains('menu') || e.target.id === 'browse-menu-button') {
				return;
			} else if (this.props.menu.open) {
				this.props.dispatch(ToggleMenu('', ''));
			}
		});
    }

	render() {
		let confirmation, sectors, alerts, prompt, warning;

		if (this.props.confirmation.status === true) {
			confirmation = <Confirmation message={this.props.confirmation.message} note={this.props.confirmation.note} />
		}

		if (this.props.sectors) {
			sectors = this.props.sectors.map((sector, i) => {
				return <Route key={i} path={`/sectors/${sector.sector.toLowerCase()}`} render={() => <Pages.Sectors name={sector.sector} />} />;
			});
		}

		if (this.props.menu.open === 'main') {
			this.menu = <BrowseMenu sectors={this.props.sectors} hide={false} />
		} else {
			this.menu = <BrowseMenu sectors={this.props.sectors} hide={true} />
		}

		if (this.props.alerts.length > 0) {
			alerts = this.props.alerts.map((alert, i) => {
				return <Alert key={i} status={alert.status} message={alert.message} unmount={() => {
					this.props.alerts.splice(0, 1);
					this.props.dispatch(RemoveAlert(this.props.alerts))
				}} />
			});
		} else if (this.props.alerts.length === 0) {
			alerts = [];
		}

		if (this.props.prompt.text) {
			prompt = <Prompt text={this.props.prompt.text} data={this.props.prompt.data} />;
		}

		if (this.props.warning.message) {
			warning = <Warning message={this.props.warning.message} />;
		}

		return (
			<div className='col-container'>
				{warning}
				{prompt}
				{confirmation}
				<TopBar />

				<div className='position-relative'>{this.menu}</div>

				<section className='main-container'>
					<Switch>
						<Route exact path='/' component={Pages.Main} />
						<Route exact path='/view' component={Pages.ViewUser} />
						<Route exact path='/dashboard/list' render={() => <Pages.Dashboard user={this.props.user}><Pages.ListSettings user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/saved_listings' render={() => <Pages.Dashboard user={this.props.user}><Pages.SavedListings user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/edit' render={() => <Pages.Dashboard user={this.props.user}><Pages.EditUser user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/settings' render={() => <Pages.Dashboard user={this.props.user}><Pages.UserSettings user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/messages/:stage' render={() => <Pages.Dashboard user={this.props.user}><Pages.Messages user={this.props.user} /></Pages.Dashboard>} />} />
						<Route exact path='/dashboard/message/:stage/:id/details' render={() => <Pages.Dashboard user={this.props.user}><Pages.MessageDetails user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/listing/:id' render={() => <Pages.ListingDetails user={this.props.user} />} />
						<Route exact path='/user/:username' render={() => <Pages.ViewUser user={this.props.user} />} />
						<Route exact path='/account/login' render={() => <Pages.Login user={this.props.user} />} />
						<Route exact path='/account/register' render={() => <Pages.Register user={this.props.user} />} />
						{sectors}
						<Route exact path='/sectors/:sector' component={Pages.Sectors} />

						<Route exact path='/admin-panel' render={() => <Admin.Admin><Admin.AdminOverview user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/sectors' render={() => <Admin.Admin><Admin.AdminSectors user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/users' render={() => <Admin.Admin><Admin.AdminUsers user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/listings' render={() => <Admin.Admin><Admin.AdminListings user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />

						<Route render={() => <Pages.Response code={404} header={'Not Found'} message={`This page you're trying to access does not exist.`} />} />
					</Switch>
				</section>

				<div className='alert-container'>{alerts}</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.Login,
		confirmation: state.Confirmation,
		sectors: state.Sectors.sectors,
		alerts: state.Alert.alerts,
		prompt: state.Prompt,
		warning: state.Warning,
		menu: state.Menu
	}
}

export default withRouter(connect(mapStateToProps)(App));
