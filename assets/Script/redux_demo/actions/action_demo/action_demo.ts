// import { AsyncThunkAction } from '@reduxjs/toolkit';

import { AppDispatch, GetState } from '../../store/store_demo';

import {
  fetchUserInfo,
  updateUserInfo,
} from '../../reducers/reducer_slice_demo/reducer_slice_demo';

const initMainPageAction =
  () =>
  async (dispatch: AppDispatch, getState: GetState, {}) => {
    dispatch(
      updateUserInfo({
        nickName: 'loading userInfo...',
      }),
    );
    await dispatch(fetchUserInfo());
    const state = getState();
    if (state.mainPage.userInfo.nickName === 'zhangsan') {
      return new Promise(resolve => {
        setTimeout(() => {
          return resolve(
            dispatch(
              updateUserInfo({
                nickName: 'hi, zhangsan!',
              }),
            ),
          );
        }, 1000);
      });
    }
  };

export { initMainPageAction };
