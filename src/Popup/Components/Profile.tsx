import {
    useAccount,
    useDisconnect,
    useEnsName,
  } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { reverseResolution } from './Resolution'
import { useEffect, useState } from 'react'
import { useLocalStorage, truncate } from '../Utils/utils'
import { useDebounce } from 'use-debounce'
import { Listbox } from '@headlessui/react'

function copiedMessage() {
  return <span aria-label="Copied" className='text-green-500 max-w-[330px] text-xs text-center absolute'>Address copied!</span>
}
  
export function Profile() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address, chainId: 1, })
  const [unsName, setUnsName] = useLocalStorage('domain', '');
  const [debouncedEnsName] = useDebounce(ensName, 500)
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const getUns = async () => {
      if (address) {
        const unsName = await reverseResolution(address);
        setUnsName(unsName)
      }
    }
    getUns()
}, [address]);

  const domain = unsName ? unsName : debouncedEnsName ? debouncedEnsName : ''

  // Change asset on asset change
  const copyAddress = () => {
    navigator.clipboard.writeText(address || '');
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000);
  };

  const sendMessage = () => {
    chrome.runtime.sendMessage({ greeting: 'hello' });
  }

  if (isConnected) {
    return (
      <div className='max-w-[300px]'>
        <Listbox value={address || ''}>
        <div className='flex flex-col'>
          <Listbox.Button
          className='inline-flex items-center rounded-lg bg-[#0D67FE] px-3 text-sm text-white tracking-tight font-normal font-roboto max-w-[256px] min-w-[120px] w-auto h-[39px] text-center justify-center'
          >
            {truncate(domain ?? address)}
          </Listbox.Button>
          <Listbox.Options
            className='absolute z-50 max-h-60 min-h-[39px] overflow-auto rounded-lg bg-[#0D67FE] text-white text-sm shadow-md px-2 focus:outline-none focus:shadow-outline max-w-[256px] min-w-[120px] w-auto'
          >
            <Listbox.Option 
              className='flex flex-col mb-1 mt-1'
              value='Copy'
            >
              <button className='text-xs items-center hover:text-[#00C9FF]' onClick={() => copyAddress()}>{truncate(address || '')}</button>
              <span ></span>
            </Listbox.Option>
            <Listbox.Option 
              className='flex flex-row items-center mb-1 mt-1 hover:text-[#00C9FF]'
              value='Logout' 
            >
              <button onClick={() => disconnect()}>Logout</button>
            </Listbox.Option>
          </Listbox.Options>
          </div>
        </Listbox>
        {copied && copiedMessage()}
      </div>
    )
  }
  return (
    <div>
      <ConnectButton label='Connect Wallet'/>
      <button onClick={() => sendMessage}>Login</button>
    </div>
  )
}