const categoriesInitialState = {
    status: null,
    categories: null
}

export const Categories = (state = categoriesInitialState, action) => {
    switch(action.type) {
        case 'ADD_CATEGORY_SUCCESS':
        case 'STORE_CATEGORIES':
            return Object.assign(...state, {status: action.status, categories: action.categories});
        case 'ADD_CATEGORY_BEGIN':
        case 'ADD_CATEGORY_FAIL':
        case 'ADD_CATEGORY_ERROR':
        case 'STORE_CATEGORIES_ERROR':
            return Object.assign(...state, {status: action.status});
        default: return state;
    }
}