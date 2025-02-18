import { MachineAction, MachineState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './machine.initialState';

const machineSlice: StateCreator<MachineState & MachineAction> = set => ({
  ...initialState,
  setSelectedPartsName: (parts: string[]) => {
    set({ selectedPartsName: parts, reverseSelectedProduct: undefined });
  },
  setReverseSelectedProduct: (parts: string[]) => {
    set({ reverseSelectedProduct: parts });
  },
  setMachineView: (view: 'solo' | 'x-ray') => {
    set({ machineView: view });
  },
  setMachineName: (name: string) => {
    set({ machineName: name });
  },
  autoFocus: () => {
    set({ autoFocusTriggered: true });
    // Reset after a short delay (to detect subsequent triggers)
    setTimeout(() => set({ autoFocusTriggered: false }), 100);
  },
  setPartsView: (view: 'spare' | 'wear' | 'none') => {
    set({ partsView: view, selectedPartsName: [] });
  },
});

export default machineSlice;
