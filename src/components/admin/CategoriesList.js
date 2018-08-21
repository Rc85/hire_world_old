import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/admin/CategoriesList.css';
import '../../styles/admin/Admin.css';
import Loading from '../Loading';
import Menu from '../Menu';

class CategoriesList extends Component {
    render() {
        let categories;

        if (this.props.categories) {
            categories = this.props.categories.map((category, i) => {
                return <div key={i} className='admin-category-row'>
                    <div className='w-5'>{category.category_id}</div>
                    <div className='w-45'>{category.category}</div>
                    <div className='w-25'>{category.category_created_on}</div>
                    <div className='w-10'>{category.category_created_by}</div>
                    <div className='w-10'>
                        <span className='badge badge-success'>{category.category_status}</span>
                    </div>
                    <Menu name={`admin-menu-${category.category_id}`} id={category.category_id} />
                </div>
            });
        } else {
            categories = <Loading size='4x' />;
        }

        return(
            <div id='categories-list'>
                {this.props.status === 'add category loading' ? <Loading size='4x' /> : ''}
                <h2>Categories</h2>

                <div className='admin-category-header'>
                    <div className='w-5'>ID</div>
                    <div className='w-45'>Name</div>
                    <div className='w-25'>Created On</div>
                    <div className='w-10'>Created By</div>
                    <div className='w-10'>Status</div>
                    <div className='w-5'></div>
                </div>

                <hr/>

                {categories}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Categories.status,
        categories: state.Categories.categories
    }
}

export default withRouter(connect(mapStateToProps)(CategoriesList));