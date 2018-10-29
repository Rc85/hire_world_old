import React from 'react';
import PropTypes from 'prop-types';

/**
 * 
 * @param {Number} totalItems The total number of items
 * @param {Number} itemsPerPage Items per page
 * @param {Number} currentPage The current page to disable clicking
 * @param {Function} onClick The click event for each page 
 */
const Pagination = props => {
    let pages = [];
    let currentPage = props.currentPage + 1;

    for (let i = 0; i < props.totalItems / props.itemsPerPage; i++) {
        let page;

        if (currentPage === i + 1) {
            page = <div key={i} className={`page-number active`}>{i + 1}</div>
        } else {
            page = <div key={i} className='page-number' onClick={() => props.onClick(i)}>{i + 1}</div>
        }

        pages.push(page);
    }

    return(
        <div className='pagination-container'>
            <span className='mr-2'>Page: </span>
            {pages}
        </div>
    )
}

Pagination.propTypes = {
    totalItems: PropTypes.number,
    itemsPerPage: PropTypes.number,
    currentPage: PropTypes.number,
    onClick: PropTypes.func
};

export default Pagination;