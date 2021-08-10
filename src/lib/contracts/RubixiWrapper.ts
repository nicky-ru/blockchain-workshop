import Web3 from 'web3';
import * as RubixiJSON from '../../../build/contracts/Rubixi.json';
import { Rubixi } from '../../types/Rubixi';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

// 100000000000
// 10000000000000000000

export class RubixiWrapper {
    web3: Web3;

    contract: Rubixi;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(RubixiJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getStoredValue(fromAddress: string) {
        const currentFeePercentage = await this.contract.methods
            .currentFeePercentage()
            .call({ from: fromAddress });
        const currentMultiplier = await this.contract.methods
            .currentMultiplier()
            .call({ from: fromAddress });
        const currentPyramidBalanceApproximately = await this.contract.methods
            .currentPyramidBalanceApproximately()
            .call({ from: fromAddress });
        const feesSeperateFromBalanceApproximately = await this.contract.methods
            .feesSeperateFromBalanceApproximately()
            .call({ from: fromAddress });
        const totalParticipants = await this.contract.methods
            .totalParticipants()
            .call({ from: fromAddress });
        const numberOfParticipantsWaitingForPayout = await this.contract.methods
            .numberOfParticipantsWaitingForPayout()
            .call({ from: fromAddress });

        return {
            currentFeePercentage,
            currentMultiplier,
            currentPyramidBalanceApproximately,
            feesSeperateFromBalanceApproximately,
            totalParticipants,
            numberOfParticipantsWaitingForPayout
        };
    }

    async changeFeePercentage(newFeePercentage: number, fromAddress: string) {
        const tx = await this.contract.methods.changeFeePercentage(newFeePercentage).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }

    async participate(value: number, fromAddress: string) {
        const tx = await this.contract.methods.init().send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value
        });

        return tx;
    }

    async collectFees(fromAddress: string) {
        const tx = await this.contract.methods.init().send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }

    async dynamicPyramid(fromAddress: string) {
        const tx = await this.contract.methods.DynamicPyramid().send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress
        });

        return tx;
    }

    async deploy(fromAddress: string) {
        const deployTx = await (this.contract
            .deploy({
                data: RubixiJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(deployTx.contractAddress);
        return deployTx.transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
