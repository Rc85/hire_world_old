import React, { Component } from 'react';
import { Route, withRouter, Switch, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { GetSession, GetUserNotificationAndMessageCount } from './actions/FetchActions';
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
import Footer from './components/includes/site/Footer';
import ReviewMploy from './components/includes/page/ReviewMploy';
import { StripeProvider, Elements } from 'react-stripe-elements';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mainMenu: false
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.location.key !== prevProps.location.key) {
			this.props.dispatch(GetUserNotificationAndMessageCount());
		}
	}
		
	componentDidMount() {
		this.props.dispatch(GetSession());
		this.props.dispatch(GetUserNotificationAndMessageCount());

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

		let userDashboardItems = [
			{name: 'Profile', active: this.props.location.pathname === '/dashboard/edit', link: '/dashboard/edit'},
			{name: 'Friends', active: this.props.location.pathname === '/dashboard/friends', link: '/dashboard/friends'},
			{name: 'Medals', active: this.props.location.pathname === '/dashboard/medals', link: '/dashboard/medals'}
		];

		let messageDashboardItems = [
			{name: 'Inquiries', active: /^\/(messages\/Inquiries|message\/Inquire).*/.test(this.props.location.pathname) ? true : false, link: '/messages/Inquiries'},
			{name: 'Active', active: /^\/(message|jobs)\/Active.*/.test(this.props.location.pathname) ? true : false, link: '/jobs/Active'},
			{name: 'Completed', active: /^\/(message|jobs)\/Completed.*/.test(this.props.location.pathname) ? true : false, link: '/jobs/Completed'},
			{name: 'Abandoned', active: /^\/(message|jobs)\/Abandoned.*/.test(this.props.location.pathname) ? true : false, link: '/jobs/Abandoned'},
			{name: 'Appealing', active: /^\/(message|jobs)\/Appealing.*/.test(this.props.location.pathname) ? true : false, link: '/jobs/Appealing'}
		];

		let settingsDashboardItems = [
			{name: 'Listing', active: this.props.location.pathname === '/settings/listing', link: '/settings/listing'},
			{name: 'Payment', active: this.props.location.pathname === '/settings/payment', link: '/settings/payment'},
			{name: 'Account', active: this.props.location.pathname === '/settings/account', link: '/settings/account'},
			{name: 'Subscription', active: this.props.location.pathname === '/settings/subscription', link: '/settings/subscription'}
		]

		return (
			<div className='col-container'>
				{warning}
				{prompt}
				{confirmation}
				<TopBar />

				<div className='position-relative'>{this.menu}</div>

				<section className='main-container'>
					<Switch>
						<Route exact path='/' render={() => <Pages.Login user={this.props.user} />} />
						<Route exact path='/view' component={Pages.ViewUser} />

						<Route exact path='/dashboard/friends' render={() => <Pages.Dashboard user={this.props.user} items={userDashboardItems}><Pages.FriendsList user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/edit' render={() => <Pages.Dashboard user={this.props.user} items={userDashboardItems}><Pages.EditUser user={this.props.user} /></Pages.Dashboard>} />

						<Route exact path='/settings/account' render={() =>  <Pages.Dashboard user={this.props.user} items={settingsDashboardItems}><Pages.AccountSettings user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/settings/payment' render={() =>  <Pages.Dashboard user={this.props.user} items={settingsDashboardItems}><StripeProvider apiKey='pk_live_wJ7nxOazDSHu9czRrGjUqpep'><Elements><Pages.PaymentSettings user={this.props.user} /></Elements></StripeProvider></Pages.Dashboard>} />
						<Route exact path='/settings/listing' render={() => <Pages.Dashboard user={this.props.user} items={settingsDashboardItems}><Pages.Listing user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/settings/subscription' render={() => <Pages.Dashboard user={this.props.user} items={settingsDashboardItems}><Pages.SubscriptionSettings user={this.props.user} /></Pages.Dashboard>} />

						<Route exact path='/messages/Inquiries' render={() => <Pages.Dashboard user={this.props.user} items={messageDashboardItems}><Pages.Inquiries user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/message/:stage/:id/details' render={() => <Pages.Dashboard user={this.props.user} items={messageDashboardItems}><Pages.MessageDetails user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/jobs/:stage' render={() => <Pages.Dashboard user={this.props.user} items={messageDashboardItems}><Pages.Jobs user={this.props.user} /></Pages.Dashboard>} />

						<Route exact path='/listing/:id' render={() => <Pages.ListingDetails user={this.props.user} />} />

						<Route exact path='/user/:username' render={() => <Pages.ViewUser user={this.props.user} />} />
						
						<Route exact path='/account/register' render={() => <Pages.Register user={this.props.user} />} />

						<Route exact path='/sectors/:sector' component={Pages.Sectors} />

						<Route exact path='/payment/success' render={() => <Pages.Response code={200} header={'Subscribed!'} message={`Thank you for subscribing to M-ploy. We hope you'll enjoy our services.`}><div><NavLink to='/settings/listing'>Start listing now</NavLink></div></Pages.Response>} />
						<Route exact path='/subscription/cancelled' render={() => <Pages.Response code={200} header={'Unsubscribed!'} message={'We hate to see you go. Please take a moment and give M-ploy a rating.'}><div className='d-flex-center-center'><ReviewMploy /></div></Pages.Response>} />

						<Route exact path='/admin-panel' render={() => <Admin.Admin><Admin.AdminOverview user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/sectors' render={() => <Admin.Admin><Admin.AdminSectors user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />
						<Route exact path='/admin-panel/users' render={() => <Admin.Admin><Admin.AdminUsers user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/listings' render={() => <Admin.Admin><Admin.AdminListings user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />
						<Route exact path='/admin-panel/reports' render={() => <Admin.Admin><Admin.AdminReports user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/config' render={() => <Admin.Admin><Admin.AdminConfig user={this.props.user} /></Admin.Admin>} />
						{/* <Route exact path='/admin-panel/error' render={() => <Admin.Admin><Admin.AdminErrorLog user={this.props.user} /></Admin.Admin>} /> */}

						<Route render={() => <Pages.Response code={404} header={'Not Found'} message={`This page you're trying to access does not exist.`} />} />
					</Switch>
				</section>

				<div className='alert-container'>{alerts}</div>

				<Footer />
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
