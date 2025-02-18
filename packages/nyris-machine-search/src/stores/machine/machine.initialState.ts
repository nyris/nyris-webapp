import { MachineState } from 'stores/types';

export const initialState: MachineState = {
  selectedPartsName: [],
  reverseSelectedProduct: undefined,
  machineView: 'x-ray',
  machineName: '',
  autoFocusTriggered: false,
  partsView: 'none',
};
