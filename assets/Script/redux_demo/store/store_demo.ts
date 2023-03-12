import { configureStore } from '@reduxjs/toolkit';

import { createConnect } from '../../cocos-redux/connect/connect';

import reducer from '../reducers/reducer_demo';

export const store = configureStore({
  reducer,
});

export type AppDispatch = typeof store.dispatch;
export type GetState = typeof store.getState;
export type RootState = ReturnType<GetState>;

export const connect = createConnect(store);
