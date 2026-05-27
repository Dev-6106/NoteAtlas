import { createSlice } from "@reduxjs/toolkit";

interface DiscoveryModalState {
  modal: boolean;
}

const initialState: DiscoveryModalState = {
  modal: false,
};

const discoveryModalSlice = createSlice({
  name: "discoveryModal",
  initialState,
  reducers: {
    toggleDiscoveryModal: (state) => {
      state.modal = !state.modal;
    },
    openDiscoveryModal: (state) => {
      state.modal = true;
    },
    closeDiscoveryModal: (state) => {
      state.modal = false;
    },
  },
});

export const { toggleDiscoveryModal, openDiscoveryModal, closeDiscoveryModal } =
  discoveryModalSlice.actions;
export default discoveryModalSlice.reducer;
