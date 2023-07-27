import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  useBalance,
} from 'wagmi'
import { isAddress, parseEther } from 'viem'
import { useNetwork } from 'wagmi'
import { determineAddressType, isValidUnstoppableDomainName, resolveMultiAddressUns, resolveSingleAddressUns } from './Resolution'

const SINGLE_ADDRESS_LIST = 'SINGLE';

export function SendTransaction() {
  const { chain } = useNetwork()
  const currency = chain?.nativeCurrency?.symbol

  const [input, setInput] = useState('')
  const [debouncedInput] = useDebounce(input, 500)

  const [to, setTo] = useState('')

  const [error, setError] = useState('')

  const [amount, setAmount] = useState('')
  const [debouncedAmount] = useDebounce(amount, 500)

  const { config } = usePrepareSendTransaction({
    to: to,
    value: debouncedAmount ? parseEther(debouncedAmount) : undefined,
  })
  const { data, sendTransaction } = useSendTransaction(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const resolution = async () => {
    let result = ''
    if (await isValidUnstoppableDomainName(input)) {
      const addressType = determineAddressType(currency || '')
      if (addressType === SINGLE_ADDRESS_LIST) {
        result = await resolveSingleAddressUns(input, currency)
        result.includes('Err:') ? setError((result.split('Err: ')[1])) : setTo(result)
        setTo(result)
      } else {
        currency === 'MATIC' 
        ? result = await resolveMultiAddressUns(input, currency, "MATIC")
        : result = await resolveMultiAddressUns(input, currency, "ERC20")
        result.includes('Err:') ? setError((result.split('Err: ')[1])) : setTo(result)
      }
    } else {
      if (input) {
        isAddress(input) ? setTo(input) : setError('Invalid address')
      }
    }
  }

  useEffect(() => {
    setTo('')
    setError('')
    resolution()
}, [debouncedInput, currency]);

let inputClass = error 
? 'bg-white border-2 border-red-500 shadow-md rounded px-2 mb-1 focus:outline-none focus:shadow-outline h-[39px] w-[300px]' 
: to 
? 'bg-white border-2 border-green-500 shadow-md rounded px-2 mb-1 focus:outline-none focus:shadow-outline h-[39px] w-[300px]'
: 'bg-white shadow-md rounded px-2 mb-1 focus:outline-none focus:shadow-outline h-[39px] w-[300px]'
  
return (
    <form
      className='flex flex-col justify-center items-center'
      onSubmit={(e) => {
        e.preventDefault()
        sendTransaction?.()
      }}
    >
      <div className='pt-5'>
        <input
          className={inputClass}
          aria-label="Recipient"
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x, UNS, or ENS name"
          value={input}
          spellCheck='false'
        />
      </div>
      {{to} && <span className='text-white text-sm'>{to}</span>}
      {{error} && <span className='text-red-500'>{error}</span>}
      <div className='pt-5'>
        <input
          className='bg-white shadow-md rounded px-2 focus:outline-none focus:shadow-outline h-[39px] w-[150px]'
          aria-label="Amount"
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.05"
          value={amount}
        />
      </div>
      <div className='pt-5'>
        <button 
        className='inline-block rounded-lg bg-[#3596FF] px-3 text-lg text-white tracking-tight font-normal h-[39px]'
        disabled={isLoading || !sendTransaction || !to || !amount}
        >
          {isLoading ? 'Sending...' : `Send ${Number(amount) || 0} ${currency}`}
        </button>
      </div>
      
      {isSuccess && (
        <div>
          Successfully sent {amount} ether to {to}
          {data?.hash}
          <div>
            <a href={`${chain?.blockExplorers?.default}/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </form>
  )
}
