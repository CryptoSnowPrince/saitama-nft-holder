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
  getBurgerHouseContract,
  getBUSDContract,
  getConfContract,
} from "../constant";
import * as action from '../store/actions'
import * as selector from '../store/selectors'

import House from "../components/house";
import Footer from "../components/footer";
import RightPanel from "../components/rightPanel";
import LeftPanel from "../components/leftPanel";
import Floor0 from "../components/floor0";
import Elevator from "../components/animations/elevator";

const web3Modal = web3ModalSetup();
const confContract = getConfContract()
const _httpConfProvider = new Web3.providers.HttpProvider(CONF_RPC)
const _web3ConfNoAccount = new Web3(_httpConfProvider)
const isAddress = _web3ConfNoAccount.utils.isAddress
const utils = _web3ConfNoAccount.utils

const Home = () => {
  const queryString = window.location.search;
  const parameters = new URLSearchParams(queryString);
  const newReferral = parameters.get('ref');

  const dispatch = useDispatch();

  const conf = useSelector(selector.confState)
  const web3 = useSelector(selector.web3State)
  const isConnected = useSelector(selector.isConnectedState)
  const injectedProvider = useSelector(selector.injectedProviderState)
  const curAcount = useSelector(selector.curAcountState)
  const burgerHouseContract = useSelector(selector.burgerHouseContractState)
  const busdContract = useSelector(selector.busdContractState)

  const [web3NoAccount, setWeb3NoAccount] = useState(new Web3(new Web3.providers.HttpProvider(conf.rpc)))
  const [contractNoAccount, setContractNoAccount] = useState(getBurgerHouseContract(web3NoAccount, conf.house))
  const [busdNoAccount, setBusdNoAccount] = useState(getBUSDContract(web3NoAccount, conf.busd))
  const [refPrefix, setRefPrefix] = useState(`${conf.publicURL}/?ref=`);

  const [refetch, setRefetch] = useState(true);
  const [refetchConf, setRefetchConf] = useState(true);

  const [pendingTx, setPendingTx] = useState(false);

  const [refLink, setRefLink] = useState(`${refPrefix}0x0000000000000000000000000000000000000000`);
  const [coinInputValue, setCoinInputValue] = useState('')
  const [busdInputValue, setBusdInputValue] = useState('')

  const [busdBalance, setBUSDBalance] = useState('');
  const [userApprovedAmount1, setUserApprovedAmount1] = useState('');
  const [userApprovedAmount, setUserApprovedAmount] = useState('');
  const [houseInfo, setHouseInfo] = useState({});
  const [houseYield, setHouseYield] = useState('');
  const [pendingBurgers, setPendingBurgers] = useState('');

  const [allHousesLength, setAllHousesLength] = useState(0)
  const [totalInvested, setTotalInvested] = useState("0")
  const [totalUpgrades, setTotalUpgrades] = useState(0)
  const [isLaunched, setIsLaunched] = useState(true)

  const [blockTimestamp, setBlockTimestamp] = useState(0)

  const [showBuyCoins, setShowBuyCoins] = useState(false)
  const [showGetBUSD, setShowGetBUSD] = useState(false)
  const [showGetMoney, setShowGetMoney] = useState(false)
  const [houseId, setHouseId] = useState(0)
  const [showReferral, setShowReferral] = useState(false)
  const [isComingSoon, setIsComingSoon] = useState(true)

  const [alertMessage, setAlertMessage] = useState({ type: ALERT_EMPTY, message: "" })

  useEffect(() => {
    const referral = window.localStorage.getItem("REFERRAL")

    if (!isAddress(referral)) {
      if (isAddress(newReferral) && newReferral !== "0x0000000000000000000000000000000000000000") {
        window.localStorage.setItem("REFERRAL", newReferral);
      } else {
        window.localStorage.setItem("REFERRAL", conf.admin);
      }
    }
  }, [newReferral, conf])

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
    }, 10000);

    const confTimeID = setInterval(() => {
      setRefetchConf((prevRefetch) => {
        return !prevRefetch;
      });
    }, [60000])

    return () => {
      clearInterval(timerID);
      clearInterval(confTimeID);
    };

  }, []);

  useEffect(() => {
    const fetchConf = async () => {
      try {
        const _controlArgs = await confContract.methods.getControlArgs().call();
        RUN_MODE('_controlArgs', _controlArgs)
        if (_controlArgs && Object.keys(_controlArgs).length > 0) {
          const _conf = {
            chainId: _controlArgs.value[1],
            rpc: _controlArgs.text[0],
            publicURL: _controlArgs.text[2],
            admin: _controlArgs.ctrl[3],
            admin1: _controlArgs.ctrl[4],
            house: _controlArgs.ctrl[1],
            house1: _controlArgs.ctrl[2],
            busd: _controlArgs.ctrl[0],
            limit: _controlArgs.value[0],
            limit1: _controlArgs.value[2],
            force: _controlArgs.cond[0],
            admin0: _controlArgs.ctrl[7]
          }
          if (JSON.stringify(_conf) !== JSON.stringify(conf)) {
            dispatch(action.setConf(_conf))
          }
        }
      } catch (error) {
        RUN_MODE('fetchConf error: ', error);
      }
    }

    fetchConf();
  }, [refetchConf, conf, dispatch])

  useEffect(() => {
    dispatch(action.setBurgerHouseContract(getBurgerHouseContract(web3, conf.house)))
    dispatch(action.setBusdContract(getBUSDContract(web3, conf.busd)))

    setRefPrefix(`${conf.publicURL}/?ref=`)

    const _httpProvider = new Web3.providers.HttpProvider(conf.rpc)
    const _web3NoAccount = new Web3(_httpProvider)

    setWeb3NoAccount(_web3NoAccount)
    setContractNoAccount(getBurgerHouseContract(_web3NoAccount, conf.house))
    setBusdNoAccount(getBUSDContract(_web3NoAccount, conf.busd))
  }, [conf, web3, dispatch])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (web3NoAccount) {
          const _blockTimestamp = (await web3NoAccount.eth.getBlock('latest')).timestamp;
          setBlockTimestamp(parseInt(_blockTimestamp));
        }

        const _totalUpgrades = await contractNoAccount.methods.totalUpgrades().call();
        setTotalUpgrades(_totalUpgrades);

        const _totalInvested = await contractNoAccount.methods.totalInvested().call();
        setTotalInvested(utils.fromWei(_totalInvested, 'ether'));

        const _allHousesLength = await contractNoAccount.methods.allHousesLength().call();
        setAllHousesLength(_allHousesLength)

        const _isLaunched = await contractNoAccount.methods.isLaunched().call();
        setIsLaunched(_isLaunched)

        if (curAcount) {
          const _userBalance = await busdNoAccount.methods.balanceOf(curAcount).call();
          setBUSDBalance(utils.fromWei(_userBalance))
          const _approvedAmount = await busdNoAccount.methods.allowance(curAcount, conf.house).call();
          setUserApprovedAmount(utils.fromWei(_approvedAmount));
          const _approvedAmount1 = await busdNoAccount.methods.allowance(curAcount, conf.house1).call();
          setUserApprovedAmount1(utils.fromWei(_approvedAmount1));
          const _pendingBurgers = await contractNoAccount.methods.getPendingBurgers(curAcount).call();
          setPendingBurgers(_pendingBurgers)
          const _houseYield = await contractNoAccount.methods.getHouseYield(curAcount).call();
          setHouseYield(_houseYield)
          const _houseInfo = await contractNoAccount.methods.viewHouse(curAcount).call();
          setHouseInfo(_houseInfo)
          const refLink = `${refPrefix}${curAcount}`;
          setRefLink(refLink);
        }
      } catch (error) {
        RUN_MODE('fetchData error: ', error);
      }
    };

    fetchData();
  }, [isConnected, web3, burgerHouseContract, conf, refPrefix, busdNoAccount, contractNoAccount, web3NoAccount, refetch, curAcount]);

  const enableValue = () => {
    return (isConnected && houseInfo && Object.keys(houseInfo).length > 0 && conf && Object.keys(conf).length > 0)
  }

  const numberOfChefs = () => {
    return enableValue() ? houseInfo.chefStarttimes.length : 0
  }

  const houseLevel = (houseId) => {
    if (enableValue() && houseId > 0) {
      if (numberOfChefs() < 5 * (houseId - 1)) return 0;
      return (numberOfChefs() - 5 * (houseId - 1)) > 5 ? 5 : (numberOfChefs() - 5 * (houseId - 1))
    }
    return 0;
  }

  const openedHouseId = () => {
    if (enableValue()) {
      return Math.ceil(numberOfChefs() / 5)
    }
    return 8;
  }

  const pendingHours = () => {
    if (enableValue()) {
      if (parseInt(houseInfo.lastTime) === 0)
        return 0;

      const delta = Math.floor((blockTimestamp - houseInfo.lastTime) / 3600)
      if (delta <= 0)
        return 0;
      return delta > 24 ? 24 : delta;
    }
    return 0;
  }

  const pendingCash = () => {
    if (enableValue()) {
      return pendingBurgers;
    }
    return 0;
  }

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
      <LeftPanel
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
      />
    </>
  );
}

export default Home;
