import Web3 from 'web3';
// import { IERC20ABI } from './IERC20ABI';
import { ERC20ABI } from './ERC20ABI';
import { ERC20 } from '../../types/ERC20';

// const SUDT_PROXY_CONTRACT_ABI = IERC20ABI.abi;
const SUDT_PROXY_CONTRACT_ABI = ERC20ABI.abi;

// const SUDT_PROXY_CONTRACT_ADDRESS = '0xd6638719174438d218764e8dF8eB72c0E7938Cc4';
const SUDT_PROXY_CONTRACT_ADDRESS = '0xaAb89A99Fc0e8eF6CDE1d588B411051B7f2B045a';

export class SUDTBalanceGetter {
    web3: Web3;

    contract: ERC20;

    address: string;

    constructor(web3: Web3) {
        this.address = SUDT_PROXY_CONTRACT_ADDRESS;
        this.web3 = web3;
        this.contract = new web3.eth.Contract(SUDT_PROXY_CONTRACT_ABI as any) as any;
        this.contract.options.address = this.address;
    }

    async getBalance(polyjuiceAddress: string, fromAddress: string) {
        return this.contract.methods.balanceOf(polyjuiceAddress).call({
            from: fromAddress
        });
    }
}
