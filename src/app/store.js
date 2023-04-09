import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = { searches: [], places: [] };

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    addSearch: (state, action) => {
      const search = action.payload;
      if (!state.places.includes(search.place_id)) {
        state.places.push(search.place_id);
        state.searches.push(search);
      }
    },
  },
});

export const { addSearch } = searchSlice.actions;

const store = configureStore({
  reducer: searchSlice.reducer,
});

export default store;
