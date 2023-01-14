// Wallet Selectors
export const web3State = (state) => state.auth.web3;
export const isConnectedState = (state) => state.auth.isStarted;
export const injectedProviderState = (state) => state.auth.injectedProvider;
export const curAcountState = (state) => state.auth.curAcount;
