import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: true,
  modals: {
    addPassword: false,
    editPassword: null, // item id if open
    deleteWarning: false,
  },
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    },
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      if (action.payload === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
    openModal(state, action) {
      const { modalName, data } = action.payload;
      state.modals[modalName] = data !== undefined ? data : true;
    },
    closeModal(state, action) {
      state.modals[action.payload] = false;
    },
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, closeSidebar, openModal, closeModal, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
