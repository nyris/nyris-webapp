import { StateCreator } from 'zustand';
import { SidePanelAction, SidePanelState } from 'stores/types';

import { initialState } from './sidePanel.initialState';

const sidePanelSlice: StateCreator<SidePanelState & SidePanelAction> = set => ({
  ...initialState,
  setShowSidePanel: (showSidePanel: boolean) => set(() => ({ showSidePanel })),
});

export default sidePanelSlice;
