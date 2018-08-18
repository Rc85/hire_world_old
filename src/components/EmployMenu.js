import React, { Component } from 'react';
import '../styles/EmployMenu.css';

class EmployMenu extends Component {
    render() {
        return(
            <div id='employ-menu' style={this.props.show ? {right: '0'} : {right: '-15%'}}>
                <a href='#'>Artists</a>
                <a href='#'>Agencies</a>
                <a href='#'>Childcare</a>
                <a href='#'>Consultants</a>
                <a href='#'>Couriers</a>
                <a href='#'>Designers</a>
                <a href='#'>Developers</a>
                <a href='#'>Events</a>
                <a href='#'>Health</a>
                <a href='#'>Homecare</a>
                <a href='#'>Laborers</a>
                <a href='#'>Personal</a>
                <a href='#'>Petcare</a>
                <a href='#'>Repairs</a>
                <a href='#'>Trainers</a>
            </div>
        )
    }
}

export default EmployMenu;