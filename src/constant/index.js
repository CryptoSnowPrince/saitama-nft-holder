import dotenv from "dotenv";

dotenv.config();

export function RELEASE(param1, param2, ...param3) {
	return
}

export const DEBUG = console.log

export const RUN_MODE = RELEASE

export const NFT_ADDRESS = process.env.REACT_APP_NFT
export const API_KEY = process.env.REACT_APP_API
export const MAINNET = parseInt(process.env.REACT_APP_MAINNET)