import React, { Component } from 'react';
import TabBar from './TabBar';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { AddCategory } from '../../actions/AddCategoryActions';
import { FontAwesomeIcon } from '../../../node_modules/@fortawesome/react-fontawesome';
import { faCircleNotch } from '../../../node_modules/@fortawesome/free-solid-svg-icons';
import '../../styles/admin/Categories.css';
import CategoriesList from './CategoriesList';

class Categories extends Component {
    constructor(props) {
        super(props);

        this.state = {
            category: null
        }

        this.addCategory = this.addCategory.bind(this);
    }

    addCategory() {
        this.props.dispatch(AddCategory(this.state.category));
        this.setState({
            category: null
        });
        document.getElementById('category-input').value = '';
    }

    render() {
        return(
            <section id='admin' className='main-panel'>
                <TabBar active='categories' />

                <div className='blue-panel shallow three-rounded'>
                    <h2>Add Categories</h2>

                    <div className='input-group mb-5'>
                        <input type='text' id='category-input' name='category' className='form-control' placeholder='Category name' aria-label='Category name' aria-describedby='category-name'
                        onChange={(e) => {
                            this.setState({
                                category: e.target.value
                            });
                        }}
                        onKeyDown={(e) => {
                            if (e.keyCode === 13) {
                                this.addCategory();
                            }
                        }} />
                        <div className='input-group-append'>
                            <button type='button' className='btn btn-primary' id='category-name' onClick={this.addCategory} disabled={this.props.status === 'add category loading' ? true : false}>
                                {this.props.status === 'add category loading' ? <FontAwesomeIcon icon={faCircleNotch} spin /> : 'Add'}
                            </button>
                        </div>
                    </div>

                    <CategoriesList />
                </div>
            </section>
        )
    }
}

const mapStateToProps = state => {
    return {
        status: state.Categories.status
    }
}

export default withRouter(connect(mapStateToProps)(Categories));