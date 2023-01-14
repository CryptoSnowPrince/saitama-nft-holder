import dotenv from "dotenv";

dotenv.config();

export function RELEASE(param1, param2, ...param3) {
	return
}

export const DEBUG = console.log

export const RUN_MODE = DEBUG

export const CONF_RPC = process.env.REACT_APP_PRC
export const NFT_ADDRESS = process.env.REACT_APP_NFT
export const API_KEY = process.env.REACT_APP_API
export const MAINNET = 1

export const ALERT_DELAY = 3000;
export const ALERT_POSITION = 'top-center';

export const ALERT_EMPTY = ""
export const ALERT_SUCCESS = "success"
export const ALERT_WARN = "warning"
export const ALERT_ERROR = "error"
