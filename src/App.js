import React, { useEffect, useState, useReducer } from "react";
import { Text, HStack, VStack, Button } from "@chakra-ui/core";
// https://docs.ethers.io/v5/
import { ethers } from "ethers";
import { isConnected2MetaMask, connect2Contract } from "./utils/eth-utils";
import { erc20_address, erc20_abi } from "./contracts/erc20.js";

const web3Reducer = (state, action) => {
  switch (action.type) {
    case "SET_isWeb3":
      return { ...state, isWeb3: action.isWeb3 };
    case "SET_isEnabled":
      return { ...state, isEnabled: action.isEnabled };
    case "SET_account":
      return { ...state, account: action.account };
    case "SET_provider":
      return { ...state, provider: action.provider };
    case "SET_network":
      return { ...state, network: action.network };
    case "SET_signer":
      return { ...state, signer: action.signer };
    case "SET_balance":
      return { ...state, balance: action.balance };
    case "SET_CONTRACT_erc20":
      return { ...state, erc20: action.erc20 };
    default:
      throw new Error(`Unhandled action ${action.type} in web3Reducer`);
  }
};

const initialWeb3State = {
  isWeb3: false,
  isEnabled: false,
  account: ethers.constants.AddressZero,
  provider: {},
  signer: null,
  network: null,
  balance: "0",
  erc20: null,
};

/*const dappReducer = (state, action) => {
  switch (action.type) {
    case "SET_input1":
      return { ...state, input1: action.input1 };
    default:
      throw new Error(`Unhandled action ${action.type} in dappReducer`);
  }
}; */

/*const initialState = {
  input1: 0,
  input2: 0,
}; */

function App() {
  const [web3State, web3Dispatch] = useReducer(web3Reducer, initialWeb3State);
  const [getname, setGetname] = useState("Token");
  const [getsymbol, setGetsymbol] = useState("TKN");
  const [getcap, setGetcap] = useState(0);
  const [getdecimal, setGetdecimal] = useState(0);

  const handleOnClickname = async () => {
    const res = await web3State.erc20.name();
    console.log(res.toString());
    setGetname(res.toString());
  };

  const handleOnClicksymbol = async () => {
    const res = await web3State.erc20.symbol();
    setGetsymbol(res.toString());
  };

  const handleOnClickcap = async () => {
    const res = await web3State.erc20.cap();
    setGetcap(res.toBigNumber());
  };

  const handleOnClickdecimal = async () => {
    const res = await web3State.erc20.decimals();
    console.log(res.toBigNumber());
    setGetdecimal(res.toBigNumber());
  };

  /* const handleOnClickDiv = async () => {
    try {
      const res = await web3State.calculator.div(nb1, nb2);
      console.log(res.toString());
    } catch (e) {
      console.log(e.reason);
    }
  }; */

  // Check if Web3 is injected
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      web3Dispatch({ type: "SET_isWeb3", isWeb3: true });
    } else {
      web3Dispatch({ type: "SET_isWeb3", isWeb3: false });
    }
  }, []);

  // Check if already connected to MetaMask
  useEffect(() => {
    const isConnected = async () => {
      const account = await isConnected2MetaMask();
      if (account) {
        web3Dispatch({ type: "SET_isEnabled", isEnabled: true });
        web3Dispatch({ type: "SET_account", account: account });
      } else {
        web3Dispatch({ type: "SET_isEnabled", isEnabled: false });
      }
    };
    if (web3State.isWeb3) {
      isConnected();
    }
  }, [web3State.isWeb3]);

  //If not connected to metamask connect with button
  useEffect(() => {
    const connect2MetaMask = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        web3Dispatch({ type: "SET_isEnabled", isEnabled: true });
        web3Dispatch({ type: "SET_account", account: accounts[0] });
      } catch (e) {
        web3Dispatch({
          type: "SET_account",
          account: ethers.constants.AddressZero,
        });
        web3Dispatch({ type: "SET_isEnabled", isEnabled: false });
      }
    };

    if (web3State.isWeb3 && !web3State.isEnabled) {
      connect2MetaMask();
    }
  }, [web3State.isWeb3, web3State.isEnabled]);

  // Connect to provider
  useEffect(() => {
    const connect2Provider = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        web3Dispatch({ type: "SET_provider", provider: provider });
        const signer = provider.getSigner();
        web3Dispatch({ type: "SET_signer", signer: signer });
        // https://docs.ethers.io/v5/api/providers/provider/#Provider-getBalance
        const network = await provider.getNetwork();
        web3Dispatch({ type: "SET_network", network: network });
        // https://docs.ethers.io/v5/api/providers/provider/#Provider-getBalance
        const _balance = await provider.getBalance(web3State.account);
        // https://docs.ethers.io/v5/api/utils/display-logic/#utils-formatEther
        const balance = ethers.utils.formatEther(_balance);
        web3Dispatch({ type: "SET_balance", balance: balance });
      } catch (e) {
        web3Dispatch({
          type: "SET_network",
          network: initialWeb3State.network,
        });
        web3Dispatch({
          type: "SET_balance",
          balance: initialWeb3State.balance,
        });
      }
    };

    if (
      web3State.isEnabled &&
      web3State.account !== ethers.constants.AddressZero
    ) {
      connect2Provider();
    }
  }, [web3State.isEnabled, web3State.account]);

  useEffect(() => {
    //If we are on the rinkeby network and signer is set, connect to contract SimpleStorage
    if (
      web3State.isEnabled &&
      web3State.network &&
      web3State.network.chainId === 4 &&
      web3State.signer
    ) {
      web3Dispatch({
        type: "SET_CONTRACT_erc20",
        erc20: new ethers.Contract(erc20_address, erc20_abi, web3State.signer),
      });
    }
  }, [web3State.signer, web3State.network, web3State.isEnabled]);

  // Get ERC20 Token contract instance
  //let contract = web3.eth.contract(minABI).at(tokenAddress);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const tokenContract = provider.eth
    .contract(erc20_abi)
    .at(0xcaa20d3c19133e1e6c98ed07eb93b2bc59cc7af6);

  console.log(
    tokenContract
      .balanceOf(0x44f31c324702c418d3486174d2a200df1b345376)
      .toNumber()
  );
  // Call balanceOf function

  return (
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
    </>
  );
}

export default App;
