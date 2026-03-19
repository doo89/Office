const { create } = require('zustand');
const { temporal } = require('zundo');

const useStore = create(
  temporal(
    (set) => ({
      count: 0,
      inc: () => set((state) => ({ count: state.count + 1 })),
    })
  )
);

useStore.getState().inc();
useStore.getState().inc();
console.log(useStore.temporal.getState().pastStates.length);
