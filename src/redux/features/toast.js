import { createSlice } from "@reduxjs/toolkit";

export const toastSlice = createSlice({
  name: "toast",
  initialState: {
    showToast: false,
    toastMessage: "",
    toastStatus: "",
  },
  reducers: {
    showSuccessToast: (state, action) => {
      state.showToast = true;
      state.toastMessage = action.payload.message;
      state.toastStatus = "Success";
    },
    showErrorToast: (state, action) => {
      state.showToast = true;
      state.toastMessage = action.payload.message;
      state.toastStatus = "Error";
    },
    hideToast: (state) => {
      state.showToast = false;
    },
  },
});

export const { showSuccessToast, showErrorToast, hideToast } =
  toastSlice.actions;

export const selectToast = (state) => state.toast;

export default toastSlice.reducer;
