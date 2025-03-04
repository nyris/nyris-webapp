import { create } from 'zustand';
import machineSlice from './machine.slice';

import { subscribeWithSelector } from 'zustand/middleware';

type MachineStore = ReturnType<typeof machineSlice> & { reset: () => void };

// Store Definition
const useMachineStore = create<MachineStore>()(
  subscribeWithSelector((set, ...rest) => ({
    ...machineSlice(set, ...rest),

    reset: () => {
      set(machineSlice(set, ...rest));
    },
  })),
);

export default useMachineStore;
