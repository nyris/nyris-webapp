import { StateCreator } from 'zustand';
import { MiscAction, MiscState } from 'stores/types';
import { initialState } from './misc.initialstate';

const miscSlice: StateCreator<MiscState & MiscAction> = set => ({
  ...initialState,
  setMetaFilter: filter => set(state => ({ metaFilter: filter })),
});

export default miscSlice;
