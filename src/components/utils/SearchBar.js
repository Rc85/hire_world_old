import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'reactstrap';

class SearchBar extends Component {
    render() {
        return(
            <div id='search'>
                <form action='/search' method='GET'>
                    <div className='input-group input-group-sm'>
                        <div className='input-group-prepend'><span className='input-group-text'><FontAwesomeIcon icon={faSearch} /></span></div>
                    
                    
                        <input className='form-control' type='text' name='search' aria-describedby='search-input' />
                        <div className='input-group-append'>
                            <Button color='secondary' type='submit' id='search-input' >Search</Button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default SearchBar;