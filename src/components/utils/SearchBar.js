import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/pro-solid-svg-icons'

class SearchBar extends Component {
    render() {
        return(
            <div id='search'>
                <form action='/search' method='GET'>
                    <div className='input-group input-group-sm'>
                        <div className='input-group-prepend'><span className='input-group-text'><FontAwesomeIcon icon={faSearch} /></span></div>
                    
                    
                        <input type='text' name='search' aria-describedby='search-input' />
                        <div className='input-group-append'>
                            <button className='btn btn-secondary' type='submit' id='search-input' >Search</button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default SearchBar;