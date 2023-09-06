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
/*
  // Send message to background script
  const sendMessage = async () => {
    const response = await chrome.runtime.sendMessage({ greeting: 'hello'});
    console.log(response)
  }
*/
  if (isConnected) {
    return (
      <div className='max-w-[300px]'>
        <Listbox value={address || ''}>
        <div className='flex flex-col text-lg'>
          <Listbox.Button
          className='inline-flex items-center rounded-lg bg-[#0D67FE] px-3 text-white tracking-tight font-normal font-roboto max-w-[256px] min-w-[120px] w-auto h-[39px] text-center justify-center'
          >
            {truncate(domain ?? address)}
          </Listbox.Button>
          <Listbox.Options
            className='absolute z-50 max-h-60 min-h-[39px] overflow-auto rounded-lg bg-white border border-[#0D67FE] px-2 max-w-[256px] min-w-[120px] w-auto'
          >
            <Listbox.Option 
              className='flex flex-col mb-1 mt-1'
              value='Copy'
          >
              <button className='text-xs items-center hover:text-[#0D67FE] group' onClick={() => copyAddress()}>
                {truncate(address || '')}
                <span className="group-hover:opacity-100 transition-opacity bg-[#0D67FE] px-1 text-sm text-white rounded-md absolute left-1/2 -translate-x-1/2 translate-y-full pointer-events-none opacity-0 mx-auto">Copy</span>
              </button>
              
            </Listbox.Option>
            <Listbox.Option 
              className={'flex flex-row items-center mb-1 mt-1'}
              value='Logout' 
            >
              <button className='hover:text-[#0D67FE]' onClick={() => disconnect()}>Logout</button>
            </Listbox.Option>
          </Listbox.Options>
          </div>
        </Listbox>
        {copied && copiedMessage()}
      </div>
    )
  }
  return (
    <div className='text-lg'>
      <ConnectButton label='Connect Wallet'/>
    </div>
  )
}