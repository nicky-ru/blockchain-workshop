import React, { useState } from 'react';

export const ContractInfoPanel = (props: any) => {
    const [fee, setFee] = useState('');
    const [participationValue, setParticipationValue] = useState('');

    return (
        <>
            <i>Coming soon: play with ckETH!</i>
            <h2>Player</h2>
            <div>
                <div className={'input-control'}>
                    <input
                        onChange={e => {
                            setParticipationValue(e.target.value);
                        }}
                        placeholder={'enter your CKB deposit'}
                        value={participationValue}
                    />
                    <button
                        onClick={() => {
                            props.participate(participationValue);
                        }}
                    >
                        Play
                    </button>
                </div>
            </div>
            <h2>Admin</h2>
            <div>
                <h3>Current Fee Percentage: {props.fee.fee}</h3>
                <div className={'input-control'}>
                    <input
                        onChange={e => {
                            setFee(e.target.value);
                        }}
                        placeholder={'new fee percentage'}
                        value={fee}
                    />
                    <button
                        onClick={() => {
                            props.setNewFeePercentage(fee);
                        }}
                    >
                        Change fee percentage
                    </button>
                </div>
                <br />
                <i>Info: {props.fee.info}</i>
            </div>
            <div>
                <h3>Current Multiplier: {props.multiplier.multiplier}</h3>
                <br />
                <i>Info: {props.multiplier.info}</i>
            </div>
            <div>
                <h3>Current Pyramid Balance Approximately: {props.balance.pyramidBalance}</h3>
                <i>Info: {props.balance.info}</i>
            </div>
            <div>
                <h3>Fees Seperate From Balance Approximately: {props.feesSeparete}</h3>
            </div>
            <div>
                <h3>Total Participants: {props.totalParticipants}</h3>
            </div>
            <div>
                <h3>Number Of Participants Waiting For Payout: {props.waitingParticipants}</h3>
            </div>
            <div className={'buttons-form'}>
                <br />
                <button
                    onClick={() => {
                        props.dynamicPyramid();
                    }}
                >
                    DynamicPyramid
                </button>
            </div>
        </>
    );
};
