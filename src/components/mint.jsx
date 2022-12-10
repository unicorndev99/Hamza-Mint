import { useState, useEffect } from "react";
import { getContract } from "../utils/interact"
import { BigNumber } from 'ethers'

export const Mint = (props) => {
    const { setStatus, loading, walletAddress, setMintLoading, pubsalePrice, presalePrice, connectWallet, disConnectWallet, totalSupply, maxTokens, addrWhiteList } = props
    const [mintCount, setMintCount] = useState(0)
    const [tokenPrice, setTokenPrice] = useState(0)
    const offset = (new Date().getTimezoneOffset()) * 60 * 1000
    const pubsaleTime = new Date("February 16, 2021 23:59:00").getTime() - offset
    const presaleTime = new Date("February 16, 2021 14:00:00").getTime() - offset
    

    useEffect(() => {
      let price = new Date().getTime() < pubsaleTime ? presalePrice : pubsalePrice
      setTokenPrice(price)
    }, [pubsalePrice, presalePrice])

    function onChangeMintCount(isIncrea) {
      let newCount = isIncrea ? mintCount + 1 : mintCount - 1
      if ( newCount > 50 ) newCount = 50
      if ( newCount < 0 ) newCount = 0
      // if ((newCount+totalSupply) > maxTokens ) {
      //   newCount = maxTokens-totalSupply
      // }
      console.log(newCount)
      setMintCount(newCount)
    }

    async function onMint() {

      let curTime = new Date().getTime()
      if (mintCount == 0) return
      if (!walletAddress) {
          setStatus('Please connect your Wallet')
          return
      }
      const contract = getContract(walletAddress)

      if(curTime < presaleTime) {
        setStatus('Please wait for the private sale time')
        return
      }
      // Check user is whitelisted for pre-sale
      if(curTime>=presaleTime && curTime<pubsaleTime && Array.isArray(addrWhiteList) && walletAddress != null) {
        console.log(curTime, presaleTime, pubsaleTime)
        if(!addrWhiteList.includes(walletAddress.toString().toLowerCase())) {
          setStatus('Please wait for the public sale time')
          return
        } else {
          setTokenPrice(presalePrice)
        }
      }

      if(curTime >= pubsaleTime) {
        setTokenPrice(pubsalePrice)
      }

      setMintLoading(true)
      try {
          let tx
          if (tokenPrice == pubsalePrice)
            tx = await contract.mintToken(mintCount, { value: BigNumber.from(1e9).mul(BigNumber.from(1e4)).mul(tokenPrice).mul(mintCount), from: walletAddress })
          if (tokenPrice == presalePrice)
            tx = await contract.presaleToken(mintCount, { value: BigNumber.from(1e9).mul(BigNumber.from(1e4)).mul(tokenPrice).mul(mintCount), from: walletAddress })
          
          let res = await tx.wait()
          if (res.transactionHash) {
              setStatus(`You minted ${mintCount} SP Successfully`)
              setMintLoading(false)
              setMintCount(0)
          }
      } catch (err) {
          let errorContainer =  (err.data && err.data.message)  ? err.data.message : ''
          console.log("contract err", err.message)
          let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
          let status = "Transaction failed because you have insufficient funds or sales not started"
          errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
          setMintLoading(false)
      }
    }

    return (
      <div id='mint' className='text-center'>
        <div className='container'>
          <div className='row'>
            <div className="col-sm-1" ></div>
            <div className="col-sm-10">
              <p className="title">CLAIM YOUR SP </p>
              <div className="mint-box">
                <div className="total-supply">{totalSupply} / {maxTokens}</div>
                <div className="mint-count">
                  <button className="minus-btn" onClick={() => onChangeMintCount(false)}> - </button>
                  <input type="number" readOnly value={mintCount} />   
                  <button className="plus-btn" onClick={() => onChangeMintCount(true)}> + </button>
                </div>
                <div className="max-token">
                  {50} MINT MAX
                </div>              
                <div id="mint-content" className="text-center">
                  {mintCount} SP - TOTAL: {mintCount * tokenPrice/100000 } + GAS
                </div>

                <div className="mint-btn-group">
                  {
                    walletAddress ?
                    <button id="connect-wallet-btn" onClick={ disConnectWallet }> { walletAddress.slice(0, 11) }...  </button>
                    :
                    <button id="connect-wallet-btn" onClick={ connectWallet }> CONNECT METAMASK </button>
                  }
                  {
                    loading ?
                    <button id="mint-btn" > MINTING... </button>
                    :
                    <button id="mint-btn" onClick={e => onMint(e)} > MINT </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  