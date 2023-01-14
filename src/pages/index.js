import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import {
  RUN_MODE,
  MAINNET,
  API_KEY,
  NFT_ADDRESS,
} from "../constant";
import { getRNG } from "../utils/util";
import * as action from '../store/actions'
import * as selector from '../store/selectors'

const web3Modal = web3ModalSetup();
const chain = EvmChain.ETHEREUM;
const btnStr = "CLAIM SAITACARD VOUCHER"
const Home = () => {
  const dispatch = useDispatch();

  const isStarted = useSelector(selector.isConnectedState)
  const injectedProvider = useSelector(selector.injectedProviderState)
  const curAcount = useSelector(selector.curAcountState)

  const [refetch, setRefetch] = useState(false);

  const [nftAmount, setNftAmount] = useState([])
  const [claim, setClaim] = useState(false)

  const logoutOfWeb3Modal = async () => {
    // alert("logoutOfWeb3Modal");
    web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect === "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    dispatch(action.setCurAcount(null))

    window.location.reload();
  };

  const loadWeb3Modal = useCallback(async () => {
    // alert("loadWeb3Modal");
    RUN_MODE("Connecting Wallet...");
    const provider = await web3Modal.connect();
    // alert("loadWeb3Modal1");
    const web3Provider = new Web3(provider);
    // alert("loadWeb3Modal2");
    dispatch(action.setInjectedProvider(web3Provider));
    // alert(JSON.stringify(provider));
    var acc = null;
    try {
      // alert("loadWeb3Modal try");
      acc = provider.selectedAddress
        ? provider.selectedAddress
        : provider.accounts[0];
    } catch (error) {
      // alert("loadWeb3Modal catch");
      acc = provider.address
    }
    // alert(`loadWeb3Modal4 ${acc}`);

    const _curChainId = await web3Provider.eth.getChainId();
    if (_curChainId !== MAINNET) {
      alert('Wrong Network! Please switch to Binance Smart Chain!')
      return;
    }
    // alert("loadWeb3Modal6");

    dispatch(action.setWeb3(web3Provider))
    dispatch(action.setCurAcount(acc))

    provider.on("chainChanged", (chainId) => {
      RUN_MODE(`chain changed to ${chainId}! updating providers`);
      // alert("loadWeb3Modal chainChanged");
      alert('Wrong Network! Please switch to Binance Smart Chain!')
      dispatch(action.setInjectedProvider(web3Provider));
      logoutOfWeb3Modal();
    });

    provider.on("accountsChanged", () => {
      RUN_MODE(`curAcount changed!`);
      // alert("loadWeb3Modal accountsChanged");
      alert('Current Account Changed!')
      dispatch(action.setInjectedProvider(web3Provider));
      logoutOfWeb3Modal();
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      RUN_MODE(code, reason);
      // alert("loadWeb3Modal accountsChanged");
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [dispatch]);

  useEffect(() => {
    const moralisStart = async () => {
      if (!isStarted) {
        await Moralis.start({ apiKey: API_KEY });
        dispatch(action.setIsStarted(true));
      }
    }
    moralisStart();
    const timerID = setInterval(() => {
      setRefetch((prevRefetch) => {
        return !prevRefetch;
      });
    }, 300000);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (curAcount && claim) {
          const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain,
            address: curAcount,
            tokenAddresses: [NFT_ADDRESS],
            limit: 100
          });
          RUN_MODE(response?.result.map((value, index) => value._data.tokenId));
          setNftAmount(response?.result.map((value, index) => value._data.tokenId));
        }
      } catch (error) {
        RUN_MODE('fetchData error: ', error);
      }
    };

    fetchData();
  }, [refetch, curAcount, claim]);

  const displayString = useCallback(() => {
    if (curAcount && claim) {
      switch (nftAmount.length) {
        case 0:
          return "Sorry, you are not eligible for a voucher. Please try a different wallet that contains a SaitaCity NFT"
        case 1:
          return "You are eligible, here’s your code"
        default:
          break;
      }
      if (nftAmount.length > 1) {
        return `You have ${nftAmount.length} NFTs, here’s your vouchers`
      }
    }
    return ""
  }, [nftAmount, curAcount, claim])

  const onClaim = () => {
    if (curAcount) {
      setClaim(true)
    }
  }

  const cond = curAcount && claim

  return (
    <>
      <br />
      <div className="logo-desktop" />
      <nav className="navbar navbar-expand-sm navbar-dark" style={{ marginTop: "30px" }}>
        <div className="container"
          style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <div style={{ width: "240px" }}></div>
          <button className="btn btn-primary btn-lg"
            style={{ color: "#fff", width: "170px", fontWeight: "bold" }}
            disabled={false}
            onClick={curAcount ? logoutOfWeb3Modal : loadWeb3Modal}>
            <i className="fas fa-wallet" style={{ marginRight: "12px", color: "white" }}>
            </i>
            {curAcount ? `${curAcount.toString().substr(0, 5)}...${curAcount.toString().substr(39, 41)}` : `Connect`}
          </button>
        </div>
      </nav>
      <br />
      <div className="center-body">
        <div className="roof">
          {
            curAcount && (
              <button className="btn btn-primary btn-lg"
                style={{ color: "#fff", width: "400px", fontWeight: "bold" }}
                disabled={false}
                onClick={onClaim}>
                {btnStr}
              </button>
            )
          }
        </div>
        <br />
        {
          cond &&
          (
            <div>
              <h2 className="roof">{displayString()}</h2>
            </div>
          )
        }
        <br />
        {
          cond && nftAmount.length > 0 && nftAmount.map((key) =>
            <h1 className="roof" key={key}>{getRNG(key)}</h1>
          )
        }
      </div>
    </>
  );
}

export default Home;
