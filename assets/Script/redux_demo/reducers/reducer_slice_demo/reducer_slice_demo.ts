import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const KEY = 'mainPage';

interface UserInfo {
  nickName: string;
}

interface MainPageState {
  isLoading: boolean;
  currentRequestId: string;
  userInfo: UserInfo;
}

const initialState: MainPageState = {
  isLoading: false,
  currentRequestId: '',
  userInfo: {
    nickName: 'click to load',
  },
};

const fetchUserInfo = createAsyncThunk<UserInfo, void, { state: { [KEY]: MainPageState } }>(
  `${KEY}/fetchUserInfo`,
  async (_, { getState, requestId }): Promise<UserInfo> => {
    const state = getState()[KEY];
    if (!state.isLoading || requestId !== state.currentRequestId) {
      console.warn('User info is fetching.');
      return;
    }

    return new Promise(resolve => {
      setTimeout(() => {
        return resolve({ nickName: 'zhangsan' });
      }, 1000);
    });
  },
);

const slice = createSlice({
  name: KEY,
  initialState,
  reducers: {
    updateUserInfo(state, action: PayloadAction<UserInfo | undefined, string>) {
      const { payload = {} } = action;
      state.userInfo = {
        ...state.userInfo,
        ...payload,
      };
    },
  },
  extraReducers: builder => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder
      .addCase(fetchUserInfo.pending, (state, action) => {
        if (!state.isLoading) {
          state.isLoading = true;
          state.currentRequestId = action.meta.requestId;
        }
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        if (!state.isLoading) {
          return;
        }

        // Add user to the state array
        const { payload = {} } = action;
        state.userInfo = {
          ...state.userInfo,
          ...payload,
        };
        state.isLoading = false;
        state.currentRequestId = '';
      });
  },
});

export { fetchUserInfo, UserInfo, KEY };
export const { updateUserInfo } = slice.actions;
export default slice.reducer;
