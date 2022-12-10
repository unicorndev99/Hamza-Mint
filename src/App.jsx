import { useState, useEffect } from "react";
import { BigNumber } from 'ethers'
import { ToastContainer, toast } from 'react-toastify';
import { connectWallet, getCurrentWalletConnected, getContract, disConnectWallet } from './utils/interact';
import { whiteList } from "./constants/whitelist";
import { Mint } from "./components/mint";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [walletAddress, setWalletAddress] = useState()
  const [status, setStatus] = useState(null)
  const [loading, setMintLoading] = useState(false)
  const [totalSupply, setTotalSupply] = useState(0)
  const [pubsalePrice, setPubsalePrice] = useState(null)
  const [presalePrice, setPresalePrice] = useState(null)
  const [maxTokens, setMaxTokens] = useState(0)
  const [addrWhiteList, setAddrWhiteList] = useState(null)

  useEffect(() => {
    ( async () => {
        let contract = getContract(walletAddress)
        try {
          let ts = await contract.totalSupply()
          console.log(BigNumber.from(ts).toNumber() )
          let pub = await contract.pubsalePrice()
          let pre = await contract.presalePrice()
          let mt = await contract.MAX_TOKENS()
         
          setTotalSupply(BigNumber.from(ts).toNumber())
          setMaxTokens(BigNumber.from(mt).toNumber())
          setPubsalePrice( (BigNumber.from(pub).div(BigNumber.from(1e9).mul(BigNumber.from(1e4))).toString() ) )  // original value * 1e5
          setPresalePrice( (BigNumber.from(pre).div(BigNumber.from(1e9).mul(BigNumber.from(1e4))).toString() ) )  // original value * 1e5
        } catch(err) {
          console.log(err)
        }
    })();
  }, [loading, walletAddress])

  useEffect(() => {
    getCurrentWalletConnected()
      .then((walletResponse) => {
        console.log("current res", walletResponse)
        setWalletAddress(walletResponse.address)
        setStatus(walletResponse.status)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    if (status) {
      notify()
      setStatus(null)
    }
  }, [status])

  useEffect(() => {
    let whitelist = whiteList.map(addr => addr.toString().toLowerCase());
    setAddrWhiteList(whitelist)
  }, []);

  const notify = () => toast.info(status, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });


  const onConnectWallet = () => {
    connectWallet()
    .then((walletResponse) => {
      setWalletAddress(walletResponse.address)
      setStatus(walletResponse.status)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  const onDisConnectWallet = () => {
    setWalletAddress(null)
    // const walletResponse = disConnectWallet()
    // console.log("disconnect wallet:", walletResponse)
    // setWalletAddress(walletResponse.address)
    // setStatus(walletResponse.status)
  }


  return (
    <div>
      <Mint connectWallet={onConnectWallet} disConnectWallet={onDisConnectWallet} walletAddress={walletAddress} maxTokens={maxTokens}
        loading={loading} setMintLoading={setMintLoading} pubsalePrice={pubsalePrice} presalePrice={presalePrice} setStatus={setStatus} totalSupply={totalSupply} addrWhiteList={addrWhiteList} /> 
      <ToastContainer />
    </div>
  );
};

export default App;
