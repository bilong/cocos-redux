import { combineReducers } from '@reduxjs/toolkit';

import mainPageReducer, { KEY as mainPageKey } from './reducer_slice_demo/reducer_slice_demo';

const reducer = combineReducers({
  [mainPageKey]: mainPageReducer,
});

export default reducer;
