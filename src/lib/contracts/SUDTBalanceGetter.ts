import Web3 from 'web3';
import {IERC20ABI} from './IERC20ABI';

const SUDT_PROXY_CONTRACT_ABI = IERC20ABI.abi;
// const SUDT_PROXY_CONTRACT_ADDRESS = '0xd6638719174438d218764e8dF8eB72c0E7938Cc4';
const SUDT_PROXY_CONTRACT_ADDRESS = '0xaAb89A99Fc0e8eF6CDE1d588B411051B7f2B045a';

export class SUDTBalanceGetter {
    async getBalance(web3: Web3, polyjuiceAddress: string, fromAddress: string) {
        const contract = new web3.eth.Contract(
            SUDT_PROXY_CONTRACT_ABI,
            SUDT_PROXY_CONTRACT_ADDRESS
        );
        return contract.methods.balanceOf(polyjuiceAddress).call({
            from: fromAddress
        });
    }
}