import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: null,
  isAuthChecked: false,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    updateClientData: (state, action) => {
      state.userData = action.payload.userData;
      if (action.payload.isAuthChecked !== undefined) {
        state.isAuthChecked = action.payload.isAuthChecked;
      }
    }
,
    clearClientData: (state) => {
      state.userData = null;
      state.isAuthChecked = false;
    },
  },
});

export const { updateClientData, clearClientData } = clientSlice.actions;
export default clientSlice.reducer;