import { getUserCreditAndPayment } from "@/api/payment";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface CreditMenuStateType {
  credits: number;
  paymentType: string;
}

export const fetchUserCreditAndPayment = createAsyncThunk(
  "creditMenu/fetchCredits",
  async (userId: string) => getUserCreditAndPayment(userId)
);

interface CreditMenuState {
  result: CreditMenuStateType;
  loading: boolean;
  error: string | null;
}

const initialState: CreditMenuState = {
  result: { credits: 0, paymentType: "" },
  loading: false,
  error: null,
};

const creditMenuSlice = createSlice({
  name: "creditMenu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCreditAndPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCreditAndPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload as CreditMenuStateType;
      })
      .addCase(fetchUserCreditAndPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch credits";
      });
  },
});

export default creditMenuSlice.reducer;