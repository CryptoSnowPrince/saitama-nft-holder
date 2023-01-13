import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import {
  RUN_MODE,
  CONF_RPC,
  ALERT_DELAY,
  ALERT_POSITION,
  ALERT_EMPTY,
  ALERT_SUCCESS,
  ALERT_WARN,
  ALERT_ERROR,
  getNFTContract,
} from "../constant";
import * as action from '../store/actions'
import * as selector from '../store/selectors'

import House from "../components/house";
import Footer from "../components/footer";
import RightPanel from "../components/rightPanel";
import LeftPanel from "../components/leftPanel";
import Floor0 from "../components/floor0";

const web3Modal = web3ModalSetup();
const nftContract = getNFTContract()
const _httpConfProvider = new Web3.providers.HttpProvider(CONF_RPC)
const _web3ConfNoAccount = new Web3(_httpConfProvider)
const isAddress = _web3ConfNoAccount.utils.isAddress
const utils = _web3ConfNoAccount.utils

const Home = () => {
  const dispatch = useDispatch();

  const web3 = useSelector(selector.web3State)
  const isConnected = useSelector(selector.isConnectedState)
  const injectedProvider = useSelector(selector.injectedProviderState)
  const curAcount = useSelector(selector.curAcountState)

  const [refetch, setRefetch] = useState(false);
  const [pendingTx, setPendingTx] = useState(false);

  const [accountData, setAccountData] = useState(0)

  const [alertMessage, setAlertMessage] = useState({ type: ALERT_EMPTY, message: "" })

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
    dispatch(action.setIsConnected(false))

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

    // const _curChainId = await web3Provider.eth.getChainId();
    // if (_curChainId !== MAINNET) {
    //   setAlertMessage({ type: ALERT_ERROR, message: 'Wrong Network! Please switch to Binance Smart Chain!' })
    //   return;
    // }
    // alert("loadWeb3Modal6");

    dispatch(action.setWeb3(web3Provider))
    dispatch(action.setCurAcount(acc))
    dispatch(action.setIsConnected(true))

    provider.on("chainChanged", (chainId) => {
      RUN_MODE(`chain changed to ${chainId}! updating providers`);
      // alert("loadWeb3Modal chainChanged");
      setAlertMessage({ type: ALERT_ERROR, message: 'Wrong Network! Please switch to Binance Smart Chain!' })
      dispatch(action.setInjectedProvider(web3Provider));
      logoutOfWeb3Modal();
    });

    provider.on("accountsChanged", () => {
      RUN_MODE(`curAcount changed!`);
      // alert("loadWeb3Modal accountsChanged");
      setAlertMessage({ type: ALERT_WARN, message: 'Current Account Changed!' })
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
    const timerID = setInterval(() => {
      setRefetch((prevRefetch) => {
        return !prevRefetch;
      });
    }, 30000);

    return () => {
      clearInterval(timerID);
    };

  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (curAcount) {
          const _accountData = await nftContract.methods.totalUpgrades(curAcount).call();
          setAccountData(_accountData);
        }
      } catch (error) {
        RUN_MODE('fetchData error: ', error);
      }
    };

    fetchData();
  }, [isConnected, web3, nftContract, refetch, curAcount]);

  const handleClose = useCallback(() => {
    setAlertMessage({ type: ALERT_EMPTY, message: "" })
  }, [setAlertMessage])

  const notifySuccess = useCallback(() => {
    toast.success(alertMessage.message, {
      position: ALERT_POSITION,
      autoClose: ALERT_DELAY,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClose: handleClose,
      className: 'alert-message-success'
    });
  }, [alertMessage.message, handleClose]);

  const notifyError = useCallback(() => {
    toast.error(alertMessage.message, {
      position: ALERT_POSITION,
      autoClose: ALERT_DELAY,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClose: handleClose,
      className: 'alert-message-error'
    });
  }, [alertMessage.message, handleClose]);

  const notifyWarn = useCallback(() => {
    toast.warn(alertMessage.message, {
      position: ALERT_POSITION,
      autoClose: ALERT_DELAY,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClose: handleClose,
      className: 'alert-message-warn',
      progressClassName: 'alert-message-warn-progress'
    });
  }, [alertMessage.message, handleClose]);

  useEffect(() => {
    switch (alertMessage.type) {
      case ALERT_ERROR:
        notifyError()
        return;
      case ALERT_SUCCESS:
        notifySuccess()
        return;
      case ALERT_WARN:
        notifyWarn()
        return;
      case ALERT_EMPTY:
        return;
      default:
        handleClose();
        return;
    }

  }, [alertMessage, notifyError, notifyWarn, notifySuccess, handleClose])

  return (
    <>
      <br />
      <ToastContainer />
      <nav className="navbar navbar-expand-sm navbar-dark" style={{ marginTop: "30px" }}>
        <div className="container"
          style={{justifyContent: 'space-between', flexDirection: 'row'}}>
          <div style={{ width: "200px" }}></div>
          {/* <div style={{ width: "200px", height: "140px" }}></div> */}
          <button className="btn btn-primary btn-lg btnd btn-custom"
            style={{ color: "#fff", width: "155px", fontWeight: "bold" }}
            disabled={pendingTx}
            onClick={isConnected ? logoutOfWeb3Modal : loadWeb3Modal}>
            <i className="fas fa-wallet" style={{ marginRight: "12px", color: "white" }}>
            </i>
            {/* {connButtonText} */}
          </button>
        </div>
      </nav>
      <div className="container"></div>
      {/* <LeftPanel
        isConnected={isConnected}
        curAcount={curAcount}
        coins={enableValue() ? houseInfo.coins : "--"}
        cash={enableValue() ? houseInfo.cash : "--"}
        yieldValue={enableValue() ? `+ ${houseYield / 10}` : "--"}
        setShowBuyCoins={setShowBuyCoins}
        setShowGetBUSD={setShowGetBUSD}
        setShowReferral={setShowReferral}
        setAlertMessage={setAlertMessage}
      // logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
      <RightPanel
        allHousesLength={allHousesLength}
        totalInvested={totalInvested}
        totalUpgrades={totalUpgrades}
        partners={enableValue() ? `${parseInt(houseInfo.refs) + parseInt(houseInfo.refs2) + parseInt(houseInfo.refs3)}` : `0`}
      />
      <div className="house">
        <div id="cloud-intro" />
        <div className="roof" />
        <div className="floors">
          <Elevator openedHouseId={openedHouseId()} />
          {[8, 7, 6, 5, 4, 3, 2, 1].map((value) => ( // value = 8, 7, 6, 5, 4, 3, 2, 1
            <House
              key={value}
              houseLevel={houseLevel(value)}
              id={value}
              isConnected={isConnected}
              setAlertMessage={setAlertMessage}
              setHouseId={setHouseId} />
          ))}
          <Floor0 showDeliveryMan={!enableValue() || numberOfChefs() > 0} />
        </div>
      </div>
      <Footer
        isConnected={isConnected}
        setShowGetMoney={setShowGetMoney}
        loadWeb3Modal={loadWeb3Modal}
      /> */}
    </>
  );
}

export default Home;
