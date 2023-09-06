import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useBalance,
  usePrepareSendTransaction,
  useSendTransaction,
} from 'wagmi'
import { Address, isAddress, parseEther } from 'viem'
import { useNetwork } from 'wagmi'
import { fetchEnsAddress } from '@wagmi/core'
import { determineAddressType, isValidDomainName, isValidUnstoppableDomainName, resolveMultiAddressUns, resolveSingleAddressUns } from './Resolution'
import { ethAssets, polygonAssets } from '../Utils/constants'
import { Listbox } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'

const SINGLE_ADDRESS_LIST = 'SINGLE';

function GetBalance(address: Address, asset: any) {
  const { data } = useBalance({
    address: address,
    token: asset?.contract,
    onError(error) {
      console.log('Error', error)
    },
  })

  return data?.formatted || '0'
}

function SendErc20(to: any, asset: any, amount: any, chain: any, enabled: any) {
  const { config } = usePrepareContractWrite({
    address: asset?.contract,
    abi: asset?.abi,
    functionName: 'transfer',
    enabled: enabled,
    args: [
      to,
      amount ? parseEther(amount) : 0,
    ],
  })
  
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  return (
    <>
      <div className='pt-5'>
        <button 
        aria-label="Send"
        className='inline-block rounded-lg bg-[#0D67FE] px-3 text-md text-white tracking-tight font-normal h-[39px] text-lg'
        disabled={isLoading || !to || !amount || !write}
        onClick={() => write?.()}
        >
          {isLoading ? 'Sending...' : `Send ${(Math.floor(Number(amount)*100000000)/100000000) || 0} ${asset?.symbol}`}
        </button>
      </div>
      
      {isSuccess && (
        <div className='pt-5 text-black text-md max-w-[330px] text-center'>
          {`Successfully sent ${amount} ${asset?.symbol}! 🎉`}
          <div className='pt-1'>
            <a className='underline' href={`${chain?.blockExplorers?.default?.url}/tx/${data?.hash}`} target="_blank" rel="noopener noreferrer">View Transaction</a>
          </div>
        </div>
      )}
    </>
  )
}

function SendNative(to: any, asset: any, amount: any, chain: any, enabled: any) {
  const { config } = usePrepareSendTransaction({
    to: to,
    value: amount ? parseEther(amount) : undefined,
    enabled: enabled
  })
  const { data, isLoading, isSuccess, isError ,sendTransaction } = useSendTransaction(config)

  return (
    <>
      <div className='pt-5 text-lg'>
        <button 
        aria-label="Send"
        className='inline-block rounded-lg bg-[#0D67FE] px-3 text-md text-white tracking-tight font-normal h-[39px]'
        disabled={isLoading || !to || !amount || !sendTransaction}
        onClick={() => sendTransaction?.()}
        >
          {!isError && isLoading ? 'Sending...' : `Send ${(Math.floor(Number(amount)*100000000)/100000000) || 0} ${asset?.symbol}`}
        </button>
      </div>
      
      {isSuccess && (
        <div className='pt-5 text-black text-md max-w-[330px] text-center'>
          {`Successfully sent ${amount} ${asset?.symbol}! 🎉`}
          <div className='pt-1'>
            <a className='underline' href={`${chain?.blockExplorers?.default?.url}/tx/${data?.hash}`} target="_blank" rel="noopener noreferrer">View Transaction</a>
          </div>
        </div>
      )}
    </>
  )
}

type Asset = { 
  id: number, 
  symbol: string,
  version: string,
  contract: string,
  abi: any
}

export function SendTransaction() {
  const { address, isConnected } = useAccount()

  const { chain } = useNetwork()
  const [asset , setAsset] = useState<Asset>({
    id: 1,
    symbol: '',
    version:'',
    contract:'',
    abi: '',
  })

  const assets = chain?.id === 1 ? ethAssets : polygonAssets
  
  let balance = Number(GetBalance(address!, asset!))
  balance = Math.floor(Number(balance)*100000000)/100000000

  const [input, setInput] = useState('')
  const [debouncedInput] = useDebounce(input, 500)

  const [to, setTo] = useState<string | null>('')
  const [error, setError] = useState('')
  const [isDomain, setIsDomain] = useState(false)

  const [amount, setAmount] = useState('')
  const [debouncedAmount] = useDebounce(amount, 200)

  // Resolve
  const Resolution = async () => {
    let result = ''
    let data = `0x${''}` || null
    if (isValidDomainName(input) && await isValidUnstoppableDomainName(input)) {
      setIsDomain(true)
      const addressType = determineAddressType(asset?.symbol || '')
      if (addressType === SINGLE_ADDRESS_LIST) {
        result = await resolveSingleAddressUns(input, asset?.symbol)
        result.includes('Err: ') ? setError((result.split('Err: ')[1])) : setTo(result)
      } else {
        result = await resolveMultiAddressUns(input, asset?.symbol, asset?.version)
        result.includes('Err: ') ? setError((result.split('Err: ')[1])) : setTo(result)
      }
    } else if (isValidDomainName(input)) {
      setIsDomain(true)
      try {
        data = await fetchEnsAddress({
          name: input,
          chainId: chain?.id
        })
      } catch {
        data = null
      }
      typeof data !== 'string' ? setError("Invalid Domain") : setTo(data)
    } else {
      if (input) {
        isAddress(input) ? setTo(input) : setError('Invalid address')
      }
    }
  }

  // clear inputs on logout
  useEffect(() => {
    setInput('')
    setTo('')
    setError('')
    setIsDomain(false)
    setAmount('')
}, [isConnected]);

  // Re-resolve on new user input or asset change
  useEffect(() => {
    setTo('')
    setError('')
    setIsDomain(false)
    Resolution()
}, [debouncedInput, asset]);

// Change asset to native on chain change
useEffect(() => {
  setAmount('')
  const i = assets.findIndex(asset => asset?.symbol === chain?.nativeCurrency?.symbol);
    if (i > -1) {
      setAsset(assets[i])
    }
}, [chain]);

// Change asset on asset change
const handleAssetChange = (e: any) => {
  setAmount('')
  const i = assets.findIndex(asset => asset?.symbol === e);
    if (i > -1) {
      setAsset(assets[i])
    }
};

// Visual error messaging on user inputs
let inputClass = error 
? 'bg-white border border-red-500 rounded-lg px-2 mb-1 h-[49px] w-[325px] text-lg' 
: to 
? 'bg-white border border-green-500 rounded-lg px-2 mb-1 h-[49px] w-[325px] text-lg'
: 'bg-white rounded-lg px-2 mb-1 border border-slate-300 focus:border-[#0D67FE] h-[49px] w-[325px] text-lg'

let amountClass = Number(amount) > balance
? 'bg-white border border-red-500 rounded-l px-2 h-[39px] w-[150px] text-lg'
: amount 
? 'bg-white border border-green-500 rounded-l px-2 h-[39px] w-[150px] text-lg'
: 'bg-white border border-slate-300 focus:border-[#0D67FE] rounded-l px-2 h-[39px] w-[150px] text-lg'
  
return (
  <>
    <div
      className='flex flex-col justify-center items-center'
    >
      <div className='pt-5'>
        <input
          className={inputClass}
          aria-label="Recipient"
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x, Unstoppable Domain, or ENS"
          value={input || ''}
          spellCheck='false'
          disabled={!isConnected}
        />
      </div>
      {{to} && <span aria-label="Address" className='text-black text-xs max-w-[330px] text-center'>{isDomain && to}</span>}
      {{error} && <span aria-label="Error" className='text-red-500 max-w-[330px] text-xs text-center'>{error}</span>}

      <div className='flex flex-col'>
        <div className='pt-5 inline-flex items-start'>
          <span className='text-black text-lg pr-[39px] relative'>{'Asset: '}</span>
          <div className='relative'>
            <Listbox value={isConnected ? asset?.symbol : ''} onChange={handleAssetChange} disabled={!isConnected}>
              <div className='flex flex-col text-lg'>
                <Listbox.Button
                className='inline-flex items-center bg-white border rounded px-2 h-[39px] w-[149px] border-slate-300 focus:border-[#0D67FE]'
                >
                  <ChevronDownIcon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <div className='relative pl-1 pr-2'>
                   {isConnected && asset?.symbol && (<img className='h-5 w-5' src={`./assets/images/${asset?.symbol}-${asset?.version}.png`} alt='assetLogo' key={asset?.id}/>)}
                  </div>
                  <span className='relative'>{isConnected ? asset?.symbol : ''}</span>
                </Listbox.Button>
                <Listbox.Options
                  className='absolute max-h-60 min-h-[39px] overflow-auto rounded bg-white px-2 w-[149px] border border-slate-300 focus:border-[#0D67FE]'
                >
                  {assets.map((token) => (
                    <Listbox.Option
                      className='flex flex-row items-center mb-1 mt-1'
                      key={token?.id}
                      value={token?.symbol || ''}
                    >
                      {token?.symbol === asset?.symbol && <CheckIcon className="h-4 w-4 text-gray-500 mr-2" aria-hidden="true" />}
                      <div className='pr-1 '>
                        {isConnected && token?.symbol && (<img className='h-5 w-5' src={`./assets/images/${token?.symbol}-${token?.version}.png`} alt='assetLogo' key={token?.id}/>)}
                      </div>
                      <button className={token?.symbol === asset?.symbol ? 'text-gray-500' : 'hover:text-[#0D67FE]'}>{token?.symbol}</button>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
        <div className='inline-flex pt-5 items-start'>
          <span className='text-black text-lg pr-5'>{'Amount: '}</span>
          <input
            className={amountClass}
            type='number'
            min="0.000001"
            aria-label="Amount"
            onChange={(e) => setAmount(e.target.value.replace(/(?<=\..*)\./g, ''))}
            placeholder="0.05"
            value={amount || ''}
            disabled={!isConnected}
          />
          <button 
          aria-label="Max"
          className='inline-block rounded-r bg-[#0D67FE] px-3 text-md text-white tracking-tight font-normal h-[39px] border border-[#0D67FE] text-lg'
          onClick={() => setAmount(String(balance))}
          disabled={!isConnected}
          >
            Max
          </button>
        </div>
        {isConnected && {balance} && <span aria-label="Balance" className='text-black text-xs text-center max-w-[330px]'>{`Balance: ${balance}`}</span>}
      </div>
      {asset?.contract ? SendErc20(to, asset, debouncedAmount, chain, (amount && (Number(amount) <= balance))) : SendNative(to, asset, debouncedAmount, chain, (amount && (Number(amount) <= balance)))}
    </div>
    </>
  )
}
