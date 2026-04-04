import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Vault Thunks ──────────────────────────────────────────

export const fetchVaultItems = createAsyncThunk(
  'vault/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/password-manager/list-passwords');
      return data.passwords; // array of password documents
    } catch (err) {
      // Backend returns 400 when no passwords exist — treat as empty list
      if (err.response?.status === 400) {
        return [];
      }
      // Network error (no response) — don't spam console
      if (!err.response) {
        return rejectWithValue('Network error — check your connection');
      }
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch vault items'
      );
    }
  }
);

export const addVaultItem = createAsyncThunk(
  'vault/addItem',
  async (itemData, { rejectWithValue }) => {
    try {
      // itemData: { username, password, platformSlug, platformName }
      await api.post('/password-manager/save-password', itemData);
      // Backend doesn't return the created item, so we re-fetch
      const { data } = await api.get('/password-manager/list-passwords');
      return data.passwords;
    } catch (err) {
      if (!err.response) {
        return rejectWithValue('Network error — check your connection');
      }
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add item'
      );
    }
  }
);

export const updateVaultItem = createAsyncThunk(
  'vault/updateItem',
  async ({ id, username, password }, { rejectWithValue }) => {
    try {
      await api.put(`/password-manager/update-password/${id}`, {
        username,
        password,
      });
      // Re-fetch to get the updated list
      const { data } = await api.get('/password-manager/list-passwords');
      return data.passwords;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update item'
      );
    }
  }
);

export const deleteVaultItem = createAsyncThunk(
  'vault/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/password-manager/delete-password/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete item'
      );
    }
  }
);

// Lazy-decrypt: fetches decrypted password for a single item via GET /get-password/:id
export const revealPassword = createAsyncThunk(
  'vault/revealPassword',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/password-manager/get-password/${id}`
      );
      // data: { message, data: { username, password } }
      return { id, decrypted: data.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to reveal password'
      );
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────

const initialState = {
  items: [],
  loading: false,
  error: null,
  // Map of item._id -> { username, password } (decrypted)
  decryptedCache: {},
};

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    clearDecryptedCache(state) {
      state.decryptedCache = {};
    },
    removeCachedPassword(state, action) {
      delete state.decryptedCache[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch ──
      .addCase(fetchVaultItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVaultItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVaultItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Add (re-fetch full list) ──
      .addCase(addVaultItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      // ── Update (re-fetch full list) ──
      .addCase(updateVaultItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      // ── Delete ──
      .addCase(deleteVaultItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item._id !== action.payload
        );
        delete state.decryptedCache[action.payload];
      })

      // ── Reveal (lazy decrypt) ──
      .addCase(revealPassword.fulfilled, (state, action) => {
        const { id, decrypted } = action.payload;
        state.decryptedCache[id] = decrypted;
      });
  },
});

export const { clearDecryptedCache, removeCachedPassword } =
  vaultSlice.actions;
export default vaultSlice.reducer;
