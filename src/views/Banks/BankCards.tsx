import React, { useCallback, useEffect, useState } from 'react';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import styled from 'styled-components';

import { Bank } from '../../basis-cash';
import { getPoolStartTime } from '../../yamUtils';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import CardIcon from '../../components/CardIcon';
import Loader from '../../components/Loader';
import useBanks from '../../hooks/useBanks';

const BankCards: React.FC = () => {
  const [banks] = useBanks();

  const rows = banks.reduce<Bank[][]>(
    (bankRows, bank) => {
      const newBankRows = [...bankRows];
      if (newBankRows[newBankRows.length - 1].length === 3) {
        newBankRows.push([bank]);
      } else {
        newBankRows[newBankRows.length - 1].push(bank);
      }
      return newBankRows;
    },
    [[]],
  );

  return (
    <StyledCards>
      {!!rows[0].length ? (
        rows.map((bankRow, i) => (
          <StyledRow key={i}>
            {bankRow.map((bank, j) => (
              <React.Fragment key={j}>
                <BankCard bank={bank} />
                {(j === 0 || j === 1) && <StyledSpacer />}
              </React.Fragment>
            ))}
          </StyledRow>
        ))
      ) : (
        <StyledLoadingWrapper>
          <Loader text="Loading bank" />
        </StyledLoadingWrapper>
      )}
    </StyledCards>
  );
};

interface BankCardProps {
  bank: Bank;
}

const BankCard: React.FC<BankCardProps> = ({ bank }) => {
  const [startTime, setStartTime] = useState(0);
  // TODO: alert if not unlocked

  const getStartTime = useCallback(async () => {
    const startTime = await getPoolStartTime(bank.contract);
    setStartTime(startTime);
  }, [bank, setStartTime]);

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedHours = hours < 10 ? `0${hours}` : hours;
    return (
      <span style={{ width: '100%' }}>
        {paddedHours}:{paddedMinutes}:{paddedSeconds}
      </span>
    );
  };

  useEffect(() => {
    if (bank && bank.id === 'ycrv_yam_uni_lp') {
      getStartTime();
    }
  }, [bank, getStartTime]);

  const poolActive = startTime * 1000 - Date.now() <= 0;

  return (
    <StyledCardWrapper>
      {bank.id === 'ycrv_yam_uni_lp' && <StyledCardAccent />}
      <Card>
        <CardContent>
          <StyledContent>
            <CardIcon>{bank.icon}</CardIcon>
            <StyledTitle>{bank.name}</StyledTitle>
            <StyledDetails>
              <StyledDetail>Deposit {bank.depositTokenName.toUpperCase()}</StyledDetail>
              <StyledDetail>Earn {`Basis ${bank.earnTokenName}`}</StyledDetail>
            </StyledDetails>
            <Button
              disabled={!poolActive}
              text={poolActive ? 'Select' : undefined}
              to={`/bank/${bank.id}`}
            >
              {!poolActive && (
                <Countdown date={new Date(startTime * 1000)} renderer={renderer} />
              )}
            </Button>
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  );
};

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  border-radius: 12px;
  filter: blur(4px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`;

const StyledCards = styled.div`
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledLoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`;

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
`;

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.grey[200]};
  font-size: 24px;
  font-weight: 700;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledDetails = styled.div`
  margin-bottom: ${(props) => props.theme.spacing[6]}px;
  margin-top: ${(props) => props.theme.spacing[2]}px;
  text-align: center;
`;

const StyledDetail = styled.div`
  color: ${(props) => props.theme.color.grey[300]};
`;

export default BankCards;