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

    if (props.totalItems === 0) {
        pages.push(<div key={1} className={`page-number active`}>1</div>);
    } else {
        for (let i = 0; i < props.totalItems / props.itemsPerPage; i++) {
            let page;

            if (currentPage === i + 1) {
                page = <div key={i} className={`page-number active`}>{i + 1}</div>
            } else {
                page = <div key={i} className='page-number' onClick={() => props.onClick(i)}>{i + 1}</div>
            }

            pages.push(page);
        }
    }

    return(
        <div className='pagination-container'>
            <span>Page: </span>
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