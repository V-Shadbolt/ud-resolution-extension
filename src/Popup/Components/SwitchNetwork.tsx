import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useNetwork, useSwitchNetwork, useAccount } from 'wagmi'

function errorMessage() {
  return <span aria-label="Error" className='text-red-500 max-w-[330px] text-xs text-center absolute'>Cannot change chains</span>
}

export function SwitchNetwork() {
  const [error, setError] = useState(false)
  const { chain } = useNetwork()
  const { chains, switchNetwork } =
    useSwitchNetwork({
      onError() {
        setError(true)
        setTimeout(() => {
          setError(false)
        }, 2000);
      },
    })
  const { isConnected } = useAccount()

  const handleNetworkChange = (e: any) => {
    const i = chains.findIndex(chain => chain?.name === e);
    if (i > -1) {
        switchNetwork?.(chains[i]?.id)
    }
  };

  return (
    <>
    {isConnected && (
    <div className='pr-4'>
      <Listbox value={chain?.name || ''} onChange={handleNetworkChange}>
      <div className='flex flex-col text-lg'>
        <Listbox.Button
        className='inline-flex items-center rounded-lg bg-[#0D67FE] px-3 text-white tracking-tight font-normal font-roboto h-[39px] w-[120px] text-center justify-center'
        >
          <ChevronDownIcon
            className="h-4 w-4"
            aria-hidden="true"
          />
          {chain?.name}
        </Listbox.Button>
        <Listbox.Options
          className='absolute z-50 max-h-60 min-h-[39px] overflow-auto rounded-lg bg-white border border-[#0D67FE] px-2 w-[120px]'
        >
          {chains.map((x) => (
              <Listbox.Option 
                className='flex flex-row items-center mb-1 mt-1'
                value={x?.name || ''} 
                key={x?.id}
              >
                {x.name === chain?.name && <CheckIcon className="h-4 w-4 text-gray-500 mr-2" aria-hidden="true" />}
                <button className={x?.name === chain?.name ? 'text-gray-500' : 'hover:text-[#0D67FE]'}>{x?.name}</button>
              </Listbox.Option>
          ))}
        </Listbox.Options>
        </div>
      </Listbox>
      {error && errorMessage()}
    </div>
    )}
    </>
  )
}
