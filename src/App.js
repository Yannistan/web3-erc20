import React, { useContext, useState, useEffect } from "react";
import { Text, Button, VStack, HStack, Input } from "@chakra-ui/core";
import { ethers } from "ethers";
import { Web3Context } from "./hooks/useWeb3";
import { erc20_address, erc20_abi } from "./contracts/erc20";

function App() {
  const [web3State, login] = useContext(Web3Context);
  const [erc20, seterc20] = useState(null);
  const [getname, setGetname] = useState("Token");
  const [getsymbol, setGetsymbol] = useState("TKN");
  const [getcap, setGetcap] = useState(0);
  const [getdecimal, setGetdecimal] = useState(0);
  const [inputAddress, setInputAddress] = useState("0x0");
  const [balance, setGetbalance] = useState(0);

  const handleOnClickname = async () => {
    const res = await erc20.name();
    setGetname(res);
  };

  const handleOnClicksymbol = async () => {
    const res = await erc20.symbol();
    setGetsymbol(res);
  };

  const handleOnClickcap = async () => {
    const res = await erc20.cap();
    setGetcap(res.toString());
  };

  const handleOnClickdecimal = async () => {
    const res = await erc20.decimals();
    setGetdecimal(res.toString());
  };


  const handleOnClickBalance = async () => {
   
    const res = await erc20.balanceOf(inputAddress);
    setGetbalance(res.toString());
  }; 


  useEffect(() => {
    if (web3State.signer !== null) {
      seterc20(new ethers.Contract(erc20_address, erc20_abi, web3State.signer));
    }
  }, [web3State.signer]);

  // web3State.is_web3 ??
  // web3State.is_logged ??
  // web3State.chain_id ??
  // web3Sate.account && provider et signer

  return (
    <>
      <Text>Web3: {web3State.is_web3 ? "injected" : "no-injected"}</Text>
      <Text>Network id: {web3State.chain_id}</Text>
      <Text>Network name: {web3State.network_name}</Text>
      <Text>MetaMask installed: {web3State.is_metamask ? "yes" : "no"}</Text>
      <Text>logged: {web3State.is_logged ? "yes" : "no"}</Text>
      <Text>{web3State.account}</Text>
      {!web3State.is_logged && (
        <>
          <Button onClick={login}>login</Button>
        </>
      )}
      {erc20 !== null && web3State.chain_id === 4 && (
        <>
          <VStack>
            <Button onClick={handleOnClickname}>Name</Button>
            <Text>{getname}</Text>

            <Button onClick={handleOnClicksymbol}>Symbol</Button>
            <Text>{getsymbol}</Text>

            <Button onClick={handleOnClickcap}>Cap</Button>
            <Text>{getcap}</Text>

            <Button onClick={handleOnClickdecimal}>Decimals</Button>
            <Text>{getdecimal}</Text>
          </VStack>
            <HStack>
            <Button onClick={handleOnClickBalance}>BalanceOf</Button>
            <Input
              value={inputAddress}
              onChange={(e) => {
                setInputAddress(e.currentTarget.value)
              }}
            />
             <Text>{balance}</Text>
            </HStack> 
        </>
      )}
    </>
  );
}

export default App;
