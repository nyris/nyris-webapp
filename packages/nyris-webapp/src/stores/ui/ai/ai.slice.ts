import { StateCreator } from 'zustand';
import { initialState } from './ai.initialState';
import { AiUiAction, AiUiState } from 'stores/types';

const aiSlice: StateCreator<AiUiState & AiUiAction> = set => ({
  ...initialState,
  setIsAiModeOpen: (isOpen: boolean) => {
    set(() => ({ isAiModeOpen: isOpen }));
  },
  toggleAiMode: () => {
    set(state => ({ isAiModeOpen: !state.isAiModeOpen }));
  },
});

export default aiSlice;
