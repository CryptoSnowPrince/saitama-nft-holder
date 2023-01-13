import NFT_ABI from './abi.json'

export function RELEASE(param1, param2, ...param3) {
	return
}

export const DEBUG = console.log

export const RUN_MODE = RELEASE

export const CONF_RPC = 'https://mainnet.infura.io/v3/'
export const NFT_ADDRESS = "0x0eB816b5AEa1F9125C626C90bF8CdcF2cCba6562";
export const API_KEY = "uyKibkyh4ljytsSBlA0VYcpsPH6ji8CXjqSZDm70J4gsiJuvaTnt1WkwAp9fH5L3"
export const MAINNET = 1

export const ALERT_DELAY = 3000;
export const ALERT_POSITION = 'top-center';

export const ALERT_EMPTY = ""
export const ALERT_SUCCESS = "success"
export const ALERT_WARN = "warning"
export const ALERT_ERROR = "error"

export function getNFTContract(web3) {
	if (web3) {
		return new web3.eth.Contract(NFT_ABI, NFT_ADDRESS);
	}
	return null;
}
