import { createSlice } from "@reduxjs/toolkit";

interface AddSourceState {
  modal: boolean;
}

const initialState: AddSourceState = {
  modal: false,
};

const addSourceSlice = createSlice({
  name: "addSource",
  initialState,
  reducers: {
    toggleAddSourceNoteModal: (state) => {
      state.modal = !state.modal;
    },
    openAddSourceModal: (state) => {
      state.modal = true;
    },
    closeAddSourceModal: (state) => {
      state.modal = false;
    },
  },
});

export const { toggleAddSourceNoteModal, openAddSourceModal, closeAddSourceModal } =
  addSourceSlice.actions;
export default addSourceSlice.reducer;
