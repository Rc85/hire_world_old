import React from 'react';
import PropTypes from 'prop-types';

const TitledContainer = props => {
    return(
        <div className={`titled-container mt-3`}>
            <h4>{props.title}</h4>

            <div className='scroller-div h-300 pt-4'>
                {props.content ? props.content : props.emptyMesage}

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