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
import { getVOUCHER_CARD } from "../utils/util";
import * as action from '../store/actions'
import * as selector from '../store/selectors'

const web3Modal = web3ModalSetup();
const chain = EvmChain.ETHEREUM;
const btnData = {
    title: "CLAIM YOUR SAITACARD BLACK VOUCHER",
    description: "Click to connect your wallet and claim your voucher. This voucher will be used when applying to SaitaCard to remove application fees."
}
const ruleData = {
    title: "Rules and regulations:",
    description: [
        `- If you hold a copy of the SaitaCity NeonDowntown NFT #1 (six story buildings) you are eligible for a SaitaCard Black free of registration fees. Please connect the wallet that holds the NFT to get your voucher.`,
        `- You will be prompted to inform this voucher in the SaitaCard registration form. One voucher will be available per NFT. If you hold more than one NFT, you will get the corresponding amount of vouchers.`,
        `- Vouchers are transferable once claimed. You are free to give them to family members or friends, but they can't be sold. Cards will be invalidated in that case.`,
        `- If you transfer the NFT to another person or wallet and you haven't used your voucher, that wallet will now be eligible for the voucher.`,
        `- Vouchers can be used only once. Before purchasing the NFT from a holder please confirm if they already used the SaitaCard Black voucher.`,
        `- ATTENTION: we will never ask for your Seed Phrase, this is a simple DApp (decentralized application) that can't control your wallets.`
    ]
}
const footer = {
    title: "For support:",
    email: "info@saitamatoken.com"
}

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
            alert('Wrong Network! Please switch to Ethereum Mainnet!')
            return;
        }
        // alert("loadWeb3Modal6");

        dispatch(action.setWeb3(web3Provider))
        dispatch(action.setCurAcount(acc))

        provider.on("chainChanged", (chainId) => {
            RUN_MODE(`chain changed to ${chainId}! updating providers`);
            // alert("loadWeb3Modal chainChanged");
            alert('Wrong Network! Please switch to Ethereum Mainnet!')
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
            if (nftAmount.length > 0) {
                return [
                    "Wallet validated. Here's your voucher(s).",
                    "Please copy and save these vouchers in a secure place. Do not show it publicly, once used they will be invalidated."
                ]
            } else {
                return [
                    "Wallet not eligible for a voucher.",
                    `The wallet you used is not holding a copy of the NeonDowntown NFT. Please try another wallet. Make sure you purchased an original copy of the NFT by checking the contract.`
                ]
            }
        }
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
            <nav className="navbar navbar-expand-sm navbar-dark">
                <div className="container"
                    style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                    <div style={{ width: "200px" }}></div>
                    <button className="btn-primary btn-lg"
                        disabled={false}
                        onClick={curAcount ? logoutOfWeb3Modal : loadWeb3Modal}>
                        <i className="fas fa-wallet" style={{ marginRight: "12px", color: "white" }}>
                        </i>
                        {curAcount ? `Disconnect` : `Connect`}
                    </button>
                </div>
            </nav>
            <br />
            <div className="center-body">
                <h1 className="btn-description">{btnData.description}</h1>
                <br />
                {
                    curAcount && (
                        <h2 className="roof">{`Your Address: ${curAcount}`}</h2>
                    )
                }
                <br />
                <div className="roof">
                    {
                        curAcount && (
                            <div>
                                <button className="btn-primary btn-lg"
                                    style={{ width: "500px" }}
                                    disabled={false}
                                    onClick={onClaim}>
                                    {btnData.title}
                                </button>
                            </div>
                        )
                    }
                </div>
                <br />
                {
                    cond &&
                    (
                        <div>
                            <h2 className="msg">{displayString()[0]}</h2>
                            <h2 className="msg-description">{displayString()[1]}</h2>
                        </div>
                    )
                }
                <br />
                {
                    cond && nftAmount.length > 0 && nftAmount.map((key, value) =>
                        <h1 className="roof" key={key}>{getVOUCHER_CARD(value)}</h1>
                    )
                }
                <h2 className="rule-title">{ruleData.title}</h2>
                <br />
                {
                    ruleData.description.map((key, value) =>
                        <h1 className="rule-description" key={key}>{key}</h1>
                    )
                }
                <br />
                <div className="footer">
                    <h2 className="footer-text">{footer.title}</h2>
                    <a className="footer-email" href="_">{footer.email}</a>
                </div>
            </div>
        </>
    );
}

export default Home;
