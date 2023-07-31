import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  useAccount,
  useFeeData,
  useBalance,
} from 'wagmi'
import { Address, isAddress, parseEther } from 'viem'
import { useNetwork } from 'wagmi'
import { determineAddressType, isValidUnstoppableDomainName, resolveMultiAddressUns, resolveSingleAddressUns } from './Resolution'

const SINGLE_ADDRESS_LIST = 'SINGLE';

function GetBalance(address: Address) {
  const { data } = useBalance({
    address: address,
  })

  return data?.formatted || '0'
}

export function SendTransaction() {
  const { address, isConnected } = useAccount()
  const balance = GetBalance(address!)

  const { chain } = useNetwork()
  const [currency, setCurrency] = useState(chain?.nativeCurrency?.symbol)

  const [input, setInput] = useState('')
  const [debouncedInput] = useDebounce(input, 500)

  const [to, setTo] = useState('')

  const [error, setError] = useState('')

  const [isDomain, setIsDomain] = useState(false)

  const [amount, setAmount] = useState('')
  const [debouncedAmount] = useDebounce(amount, 200)

  const { config } = usePrepareSendTransaction({
    to: to,
    value: debouncedAmount ? parseEther(debouncedAmount) : undefined,
  })
  const { data, sendTransaction } = useSendTransaction(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const Resolution = async () => {
    let result = ''
    if (await isValidUnstoppableDomainName(input)) {
      setIsDomain(true)
      const addressType = determineAddressType(currency || '')
      if (addressType === SINGLE_ADDRESS_LIST) {
        result = await resolveSingleAddressUns(input, currency)
        result.includes('Err: ') ? setError((result.split('Err: ')[1])) : setTo(result)
      } else {
        currency === 'MATIC' 
        ? result = await resolveMultiAddressUns(input, currency, "MATIC")
        : result = await resolveMultiAddressUns(input, currency, "ERC20")
        result.includes('Err: ') ? setError((result.split('Err: ')[1])) : setTo(result)
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
    setAmount('')
    setIsDomain(false)
    Resolution()
}, [debouncedInput, currency]);

const handleCurrencyChange = (e: any) => {
  console.log(currency)
  setCurrency(e.target.value)
};

let inputClass = error 
? 'bg-white border-2 border-red-500 shadow-md rounded px-2 mb-1 focus:outline-none focus:shadow-outline h-[39px] w-[300px]' 
: to 
? 'bg-white border-2 border-green-500 shadow-md rounded px-2 mb-1 focus:outline-none focus:shadow-outline h-[39px] w-[300px]'
: 'bg-white shadow-md rounded px-2 mb-1 focus:outline-none focus:shadow-outline h-[39px] w-[300px]'
  
return (
  <>
    {isConnected && (<form
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
          placeholder="0x, or Unstoppable Domain"
          value={input}
          spellCheck='false'
        />
      </div>
      {{to} && <span aria-label="Address" className='text-black text-xs max-w-[330px] text-center'>{isDomain && to}</span>}
      {{error} && <span aria-label="Error" className='text-red-500 max-w-[330px] text-center'>{error}</span>}
      <div className='flex flex-col'>
        <div className='pt-5 '>
          <span className='text-black text-lg pr-5'>{'Asset: '}</span>
          <select 
            className='bg-white shadow-md rounded px-2 focus:outline-none focus:shadow-outline h-[39px] min-w-[168px] w-auto' 
            value={currency} 
            onChange={handleCurrencyChange}
            >
              <option value={currency}>
                  {currency}
              </option>
          </select>
        </div>
        <div className='flex pt-5'>
          <span className='text-black text-lg pr-5'>{'Amount: '}</span>
          <input
            className='bg-white shadow-md rounded-l px-2 focus:outline-none focus:shadow-outline h-[39px] w-[150px]'
            aria-label="Amount"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.05"
            value={amount}
          />
          <button 
          aria-label="Max"
          className='inline-block rounded-r bg-[#0D67FE] px-3 text-md text-white tracking-tight font-normal h-[39px]'
          onClick={() => setAmount(balance)}
          >
            Max
          </button>
        </div>
      </div>
      {{balance} && <span aria-label="Balance" className='text-black text-xs max-w-[330px] text-center'>{`Balance: ${Math.floor(Number(balance)*100000000)/100000000} ${currency}`}</span>}
      <div className='pt-5'>
        <button 
        aria-label="Send"
        className='inline-block rounded-lg bg-[#0D67FE] px-3 text-md text-white tracking-tight font-normal h-[39px]'
        disabled={isLoading || !sendTransaction || !to || !amount}
        >
          {isLoading ? 'Sending...' : `Send ${(Math.floor(Number(amount)*100000000)/100000000) || 0} ${currency}`}
        </button>
      </div>
      
      {isSuccess && (
        <div className='pt-5 text-black text-xs max-w-[330px] text-center'>
          {`Successfully sent ${amount} ${currency}!`}
          <div className='pt-1'>
            <a className='underline' href={`${chain?.blockExplorers?.default?.url}/tx/${data?.hash}`} target="_blank" rel="noopener noreferrer">View Transaction</a>
          </div>
        </div>
      )}
    </form>
    )}
    </>
  )
}
