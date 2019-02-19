import React, { Component } from 'react';
import { Route, withRouter, Switch, NavLink, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { GetSession, GetUserNotificationAndMessageCount, GetSectors } from './actions/FetchActions';
import { RemoveAlert } from './actions/AlertActions';
import * as Pages from './components/pages';
import * as Admin from './components/admin';
import BrowseMenu from './components/includes/site/BrowseMenu';
import Confirmation from './components/utils/Confirmation';
import Alert from './components/utils/Alert';
import Prompt from './components/utils/Prompt';
import Warning from './components/utils/Warning';
import Footer from './components/includes/site/Footer';
import ReviewHireWorld from './components/includes/page/ReviewHireWorld';
import { StripeProvider, Elements } from 'react-stripe-elements';
import CheckoutConfirmation from './components/utils/CheckoutConfirmation';
import fetch from 'axios';
import { LogError } from './components/utils/LogError';
import { Alert as Alerts } from 'reactstrap';
import { isMobile, isTyping } from './actions/ConfigActions';
import { ToggleMenu } from './actions/MenuActions';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			mainMenu: false,
			announcements: [],
			announcementIds: []
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.location.key !== prevProps.location.key) {
			this.props.dispatch(GetUserNotificationAndMessageCount());
			this.props.dispatch(isTyping(false));

			fetch.post('/api/get/announcements')
			.then(resp => {
				if (resp.data.status === 'success') {
					let ids = [];
					let localIds = JSON.parse(localStorage.getItem('dismissed'));

					for (let a of resp.data.announcements) {
						if (!localIds) {
							ids.push(a.announcement_id);
						} else if (localIds && localIds.indexOf(a.announcement_id) < 0) {
							ids.push(a.announcement_id);
						}
					}

					this.setState({announcements: resp.data.announcements, announcementIds: ids});
				}
			})
			.catch(err => LogError(err, '/api/get/announcements'));
		}
	}
		
	componentDidMount() {
		this.props.dispatch(GetSectors());
		this.props.dispatch(GetSession());
		this.props.dispatch(GetUserNotificationAndMessageCount());

		window.addEventListener('resize', () => {
			if (window.innerWidth > 1024) {
				this.props.dispatch(isMobile(false));
			} else {
				this.props.dispatch(isMobile(true));
			}
		});

		if (window.innerWidth > 1024) {
			this.props.dispatch(isMobile(false));
		} else {
			this.props.dispatch(isMobile(true));
		}

		fetch.post('/api/get/announcements')
		.then(resp => {
			if (resp.data.status === 'success') {
				let ids = [];
				let localIds = JSON.parse(localStorage.getItem('dismissed'));

				for (let a of resp.data.announcements) {
					if (!localIds) {
						ids.push(a.announcement_id);
					} else if (localIds && localIds.indexOf(a.announcement_id) < 0) {
						ids.push(a.announcement_id);
					}
				}

				this.setState({announcements: resp.data.announcements, announcementIds: ids});
			}
		})
		.catch(err => LogError(err, '/api/get/announcements'));
	}
	
	dismissAlert(id) {
		let ids = [...this.state.announcementIds];

		ids.splice(ids.indexOf(id), 1);

		let localIds = JSON.parse(localStorage.getItem('dismissed'));

		if (!localIds) {
			localIds = [];
		}

		localIds.push(id);

		localStorage.setItem('dismissed', JSON.stringify(localIds));

		fetch.post('/api/user/dismiss/announcement', {id: id})
		.catch(err => LogError(err, '/api/user/dismiss/announcement'));

		this.setState({announcementIds: ids});
	}
	
	toggleMenu(e) {
		if (e.target.className === 'browse-menu-item' || e.target.id === 'browse-menu') {
			return;
		} else {
			this.props.dispatch(ToggleMenu(false, '1'));
		}
	}

	render() {
		let confirmation, sectors, alerts, prompt, warning;

		if (this.props.confirmation.status === true) {
			confirmation = <Confirmation message={this.props.confirmation.message} note={this.props.confirmation.note} />;

			if (this.props.confirmation.obj.type === 'checkout') {
				confirmation = <CheckoutConfirmation info={this.props.confirmation.obj} />;
			}
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
			<React.Fragment>
				<div className='col-container' onClick={(e) => this.toggleMenu(e)}>
					{warning}
					{prompt}
					{confirmation}
	
					<Switch>
						<Route exact path='/' render={() => <Pages.Dashboard user={this.props.user}><Pages.Login user={this.props.user} /></Pages.Dashboard>} />
	
						<Route exact path='/dashboard/edit' render={() => <Pages.Dashboard user={this.props.user}><Pages.EditUser user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/dashboard/friends' render={() => <Pages.Dashboard user={this.props.user}><Pages.FriendsList user={this.props.user} /></Pages.Dashboard>} />

						<Route exact path='/my-listing' render={() => <Pages.Dashboard user={this.props.user}><Pages.ListSettings user={this.props.user} /></Pages.Dashboard>} />
	
						<Route exact path='/messages' render={() => <Pages.Dashboard user={this.props.user}><Pages.Conversations user={this.props.user} /></Pages.Dashboard>} />

						<Route exact path='/jobs/:stage(Offers|Active|Completed|Abandoned)?' render={() => <Pages.Dashboard user={this.props.user}><Pages.Jobs user={this.props.user} /></Pages.Dashboard>} />
	
						<Route exact path='/settings/account' render={() => <Pages.Dashboard user={this.props.user}><Pages.AccountSettings user={this.props.user} /></Pages.Dashboard>} />
						<Route exact path='/settings/payment' render={() => <Pages.Dashboard user={this.props.user}><StripeProvider apiKey={process.env.REACT_ENV === 'development' ? 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R' : 'pk_live_wJ7nxOazDSHu9czRrGjUqpep'}><Elements><Pages.PaymentSettings user={this.props.user} /></Elements></StripeProvider></Pages.Dashboard>} />
						<Route exact path='/settings/connected' render={() => <Pages.Dashboard user={this.props.user}><StripeProvider apiKey={process.env.REACT_ENV === 'development' ? 'pk_test_KgwS8DEnH46HAFvrCaoXPY6R' : 'pk_live_wJ7nxOazDSHu9czRrGjUqpep'}><Elements><Pages.ConnectedSettings user={this.props.user} /></Elements></StripeProvider></Pages.Dashboard>} />
						
						<Route exact path='/subscription/purchase' render={() => <Pages.Dashboard user={this.props.user}><Pages.SubscriptionSettings user={this.props.user} /></Pages.Dashboard>} />
	
						<Route exact path='/user/:username' render={() => <Pages.Dashboard user={this.props.user}><Pages.ViewUser user={this.props.user} /></Pages.Dashboard>} />
		
						<Route exact path='/sectors/:sector' render={() => <Pages.Dashboard user={this.props.user}><Pages.Sectors user={this.props.user} /></Pages.Dashboard>} />
	
						<Route exact path='/payment/success' render={() => <Pages.Response code={200} header={'Thank You!'} message={`We really appreciate your business and hope you enjoy our service.`}><div className='mt-3'><NavLink to='/my-listing'>Start listing now</NavLink></div></Pages.Response>} />
						<Route exact path='/registration/success' render={() => <Pages.Response code={200} header={'Registration Success!'} message='An confirmation email has been sent. Please click the link provided to activate your account' />} />
						<Route exact path='/subscription/cancelled' render={() => <Pages.Response code={200} header={'Unsubscribed!'} message={'We hate to see you go. Please take a moment and give rate our service.'}><div className='d-flex-center-center'><ReviewHireWorld /></div></Pages.Response>} />
						<Route exact path='/account/created' render={() => <Pages.Response code={200} header={'Account Created! But...'} message={'Your Connected account was successfully created and connected to our platform; however, it may not be verified yet.'}><div className='mt-3'>Please check the settings in your <NavLink to='/settings/connected'>Connected Settings</NavLink>.</div></Pages.Response>} />

						<Route exact path='/admin-panel' render={() => <Admin.Admin><Admin.AdminOverview user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/sectors' render={() => <Admin.Admin><Admin.AdminSectors user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />
						<Route exact path='/admin-panel/users' render={() => <Admin.Admin><Admin.AdminUsers user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/listings' render={() => <Admin.Admin><Admin.AdminListings user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />
						<Route exact path='/admin-panel/reports' render={() => <Admin.Admin><Admin.AdminReports user={this.props.user} /></Admin.Admin>} />
						<Route exact path='/admin-panel/config' render={() => <Admin.Admin><Admin.AdminConfig user={this.props.user} /></Admin.Admin>} />
	
						<Route exact path='/error' render={() => <Pages.Response />} />
						<Route exact path='/error/:code' render={() => <Pages.Response />} />
						<Route exact path='/error/user/404' render={() => <Pages.Response code={404} header={'No Listings Found'} message={`The user does not have any active listings`}/>} />
	
						<Route render={() => <Redirect to='/error/404' />} />
					</Switch>
	
					<div className='alert-container'>{alerts}</div>
	
					{/* <TopBar />
	
					<div className='position-relative'>{this.menu}</div>
	
					<section className='main-container'>
						{this.state.announcements.length > 0 ? <div className='mx-auto mt-5 w-50'>{announcements}</div> : ''}
	
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
							
							<Route exact path='/account/register' render={() => <Pages.Register user={this.props.user} />} />
	
							<Route exact path='/sectors/:sector' component={Pages.Sectors} />
	
							<Route exact path='/payment/success' render={() => <Pages.Response code={200} header={'Subscribed!'} message={`Thank you for subscribing to HireWorld. We hope you'll enjoy our services.`}><div><NavLink to='/settings/listing'>Start listing now</NavLink></div></Pages.Response>} />
							<Route exact path='/subscription/cancelled' render={() => <Pages.Response code={200} header={'Unsubscribed!'} message={'We hate to see you go. Please take a moment and give HireWorld a rating.'}><div className='d-flex-center-center'><ReviewHireWorld /></div></Pages.Response>} />
	
							<Route exact path='/admin-panel' render={() => <Admin.Admin><Admin.AdminOverview user={this.props.user} /></Admin.Admin>} />
							<Route exact path='/admin-panel/sectors' render={() => <Admin.Admin><Admin.AdminSectors user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />
							<Route exact path='/admin-panel/users' render={() => <Admin.Admin><Admin.AdminUsers user={this.props.user} /></Admin.Admin>} />
							<Route exact path='/admin-panel/listings' render={() => <Admin.Admin><Admin.AdminListings user={this.props.user} sectors={this.props.sectors} /></Admin.Admin>} />
							<Route exact path='/admin-panel/reports' render={() => <Admin.Admin><Admin.AdminReports user={this.props.user} /></Admin.Admin>} />
							<Route exact path='/admin-panel/config' render={() => <Admin.Admin><Admin.AdminConfig user={this.props.user} /></Admin.Admin>} />
	
							<Route render={() => <Pages.Response code={404} header={'Not Found'} message={`This page you're trying to access does not exist.`} />} />
						</Switch>
					</section>
	
					<div className='alert-container'>{alerts}</div>
	
					<Footer /> */}
				</div>

				<Footer />
			</React.Fragment>
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
