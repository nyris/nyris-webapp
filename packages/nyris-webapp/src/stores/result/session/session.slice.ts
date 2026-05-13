import { StateCreator } from 'zustand';
import { initialState } from './session.initialState';
import { SessionAction, SessionState } from 'stores/types';

const sessionSlice: StateCreator<SessionState & SessionAction> = set => ({
  ...initialState,
  setSessionId: (sessionId: string) => set(() => ({ sessionId })),
  setRequestId: (requestId: string) => set(() => ({ requestId })),
});

export default sessionSlice;
