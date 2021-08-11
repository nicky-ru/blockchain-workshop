/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

// import { SimpleStorageWrapper } from '../lib/contracts/SimpleStorageWrapper';
import { RubixiWrapper } from '../lib/contracts/RubixiWrapper';
import {SUDTBalanceGetter} from "../lib/contracts/SUDTBalanceGetter";
import { CONFIG } from '../config';
import { ContractInfoPanel } from '../components/ContractInfo';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<RubixiWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [sudtBalance, setSudtBalance] = useState<number>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [storedValue, setStoredValue] = useState<number | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [l2DepositAddress, setL2DepositAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);

    const [currentFeePercentage, setCurrentFeePercentage] = useState({ fee: '', info: '' });
    const [currentMultiplier, setCurrentMultiplier] = useState({ multiplier: '', info: '' });
    const [currentPyramidBalanceApproximately, setCurrentPyramidBalanceApproximately] = useState({
        pyramidBalance: '',
        info: ''
    });
    const [
        feesSeperateFromBalanceApproximately,
        setFeesSeperateFromBalanceApproximately
    ] = useState('');
    const [totalParticipants, setTotalParticipants] = useState('');
    const [
        numberOfParticipantsWaitingForPayout,
        setNumberOfParticipantsWaitingForPayout
    ] = useState('');

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new RubixiWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function getL2DepositAddress() {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            const depositAddress = await addressTranslator.getLayer2DepositAddress(
                web3,
                accounts?.[0]
            );
            setL2DepositAddress(depositAddress.addressString);
        } else {
            setL2DepositAddress(undefined);
        }
    }

    async function getSUDTBalance() {
        const _balanceGetter = new SUDTBalanceGetter();

        try {
            const balance = await _balanceGetter.getBalance(web3, polyjuiceAddress, accounts[0]);
            setSudtBalance(balance);
        } catch (e) {
            console.log(e);
        }
    }

    async function getStoredValue() {
        const value = await contract.getStoredValue(account);
        toast('Successfully read latest stored value.', { type: 'success' });

        console.log(value);
        setCurrentFeePercentage(value.currentFeePercentage);
        setCurrentMultiplier(value.currentMultiplier);
        setCurrentPyramidBalanceApproximately(value.currentPyramidBalanceApproximately);
        setFeesSeperateFromBalanceApproximately(value.feesSeperateFromBalanceApproximately);
        setTotalParticipants(value.totalParticipants);
        setNumberOfParticipantsWaitingForPayout(value.numberOfParticipantsWaitingForPayout);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new RubixiWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setStoredValue(undefined);
    }

    async function setNewFeePercentage(value: number) {
        try {
            setTransactionInProgress(true);
            await contract.changeFeePercentage(value, account);
            toast(
                'Successfully set new fee percentage. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (e) {
            console.error(e);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function dynamicPyramid() {
        try {
            setTransactionInProgress(true);
            await contract.dynamicPyramid(account);
            toast(
                'Successfully set you as a new owner. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (e) {
            console.error(e);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function participate(value: string) {
        try {
            const valueNum = parseInt(value, 10);
            setTransactionInProgress(true);
            await contract.participate(valueNum, account);
            toast(
                'Successfully set you as a new participant. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (e) {
            console.error(e);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
            Nervos Layer 2 balance:{' '}
            <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br />
            <br />
            ckETH Balance: <b>{sudtBalance ? (sudtBalance / 10 ** 20).toString() : '-'} ckETH</b>
            <br />
            <br />
            Your Layer 2 Deposit Address on Layer 1:{' '}
            <p id={'l2deposit-address'}>
                <b>
                    {l2DepositAddress || '-'}
                </b>
            </p>
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            Deploy transaction hash: <b>{deployTxHash || '-'}</b>
            <br />
            <hr />
            <p>
                The button below will deploy a Rubixi smart contract where you can play a pyramid
                game. After the contract is deployed you can either participate in the game or try
                to claim the contract ownership and change some settings or collect all fees
                (comming soon).
            </p>
            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            <button onClick={getStoredValue} disabled={!contract}>
                Get stored values
            </button>
            {storedValue ? <>&nbsp;&nbsp;Stored value: {storedValue.toString()}</> : null}
            <br />
            <br />
            <hr />
            <button
                onClick={() => {
                    getL2DepositAddress();
                }}
            >
                Get my Deposit Address
            </button>
            <button
                onClick={() => {
                    getSUDTBalance();
                }}
            >
                Get my SUDT balance
            </button>
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <ToastContainer />
            <hr />
            <ContractInfoPanel
                fee={currentFeePercentage}
                multiplier={currentMultiplier}
                balance={currentPyramidBalanceApproximately}
                feesSeparete={feesSeperateFromBalanceApproximately}
                totalParticipants={totalParticipants}
                waitingParticipants={numberOfParticipantsWaitingForPayout}
                setNewFeePercentage={setNewFeePercentage}
                dynamicPyramid={dynamicPyramid}
                participate={participate}
            />
        </div>
    );
}
