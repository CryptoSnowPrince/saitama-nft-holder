import dotenv from "dotenv";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

dotenv.config();

/**
  Web3 modal helps us "connect" external wallets:
**/
const web3ModalSetup = () =>
  new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID, // required
          rpc: {
            1: process.env.REACT_APP_PRC, // ETH Mainnet
          },
        },
      },
    },
  });

export default web3ModalSetup;
