import React from 'react';
import PropTypes from 'prop-types';

const TitledContainer = props => {
    return(
        <div className={`titled-container mt-3`}>
            <h4>{props.title}</h4>

            <div className='scroller-div h-300 pt-4'>
                {props.content.length > 0 ? props.content : <div className='d-flex-center-center text-muted h-100'><h5>{props.emptyMessage}</h5></div>}

                {props.hasMore ? <div className='text-center'><hr/><span className='badge badge-primary' onClick={() => props.loadMore()} style={{cursor: 'pointer'}}>Load more</span></div> : ''}
            </div>
        </div>
    )
}

TitledContainer.propTypes = {
    title: PropTypes.string,
    content: PropTypes.array
};

export default TitledContainer;