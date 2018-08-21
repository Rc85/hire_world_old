import fetch from 'axios';

export const AddCategory = (value) => {
    return dispatch => {
        dispatch(AddCategoryBegin('add category loading'));

        fetch.post('/api/admin/add-category', {category: value})
        .then(resp => {
            if (resp.data.status === 'add category success') {
                dispatch(AddCategorySuccess(resp.data.status, resp.data.categories));
            } else if (resp.data.status === 'add category fail') {
                dispatch(AddCategoryFail(resp.data.status));
            } else if (resp.data.status === 'add category error') {
                dispatch(AddCategoryError(resp.data.status));
            }
        })
        .catch(err => console.log(err));
    }
}

const AddCategoryBegin = (status) => {
    return {
        type: 'ADD_CATEGORY_BEGIN',
        status
    }
}

const AddCategorySuccess = (status, categories) => {
    return {
        type: 'ADD_CATEGORY_SUCCESS',
        status,
        categories
    }
}

const AddCategoryFail = (status) => {
    return {
        type: 'ADD_CATEGORY_FAIL',
        status
    }
}

const AddCategoryError = (status) => {
    return {
        type: 'ADD_CATEGORY_ERROR',
        status
    }
}