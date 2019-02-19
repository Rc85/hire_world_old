import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LogError } from '../utils/LogError';
import fetch from 'axios';
import TitledContainer from '../utils/TitledContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import Loading from '../utils/Loading';
import ConnectedSettingsForm from '../includes/page/ConnectedSettingsForm';

class ConnectedSettings extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            status: '',
            statusMessage: '',
            account: {}
        }
    }
    
    componentDidMount() {
        this.setState({status: 'Fetching'});

        fetch.post('/api/job/accounts/fetch')
        .then(resp => {
            if (resp.data.status === 'success') {
                this.setState({status: '', account: resp.data.account});
            } else if (resp.data.status === 'error') {
                this.setState({status: ''});
            }
        })
        .catch(err => LogError(err, '/api/job/accounts/fetch'));
    }
    
    render() {
        let verificationStatus, status;

        if (this.state.status === 'Fetching') {
            status = <Loading size='5x' />;
        }

        if (Object.keys(this.state.account).length !== 0) {
            if (this.state.account.legal_entity.verification.status === 'unverified') {
                verificationStatus = <div className='mini-badge mini-badge-warning ml-1'>Unverified</div>;
            }

            return (
                <section id='connected-settings' className='main-panel'>
                    {status}
                    
                    <TitledContainer title='Connected Settings' icon={<FontAwesomeIcon icon={faLink} />} shadow bgColor='lightblue'>
                        <div className='account-id mb-3'>
                            <h2>{this.state.account.id}</h2>
                            {verificationStatus}
                        </div>

                        <ConnectedSettingsForm settings={this.state.account} user={this.props.user} update={(account) => this.setState({account: account})} />
                    </TitledContainer>
                </section>
            );
        }

        return null;
    }
}

ConnectedSettings.propTypes = {

};

export default ConnectedSettings;