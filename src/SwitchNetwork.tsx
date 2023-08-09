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
      <div className='flex flex-col'>
        <Listbox.Button
        className='inline-flex items-center rounded-lg bg-[#0D67FE] px-3 text-sm text-white tracking-tight font-normal font-roboto h-[39px] w-[120px]'
        >
          <ChevronDownIcon
            className="h-4 w-4"
            aria-hidden="true"
          />
          {chain?.name}
        </Listbox.Button>
        <Listbox.Options
          className='absolute z-50 max-h-60 min-h-[39px] overflow-auto rounded-lg bg-[#0D67FE] text-white shadow-md px-2 focus:outline-none focus:shadow-outline w-[120px]'
        >
          {chains.map((x) => (
              <Listbox.Option 
                className='flex flex-row items-center mb-1 mt-1 hover:text-[#00C9FF]'
                value={x?.name || ''} 
                key={x?.id}
              >
                {x.name === chain?.name && <CheckIcon className="h-4 w-4 text-gray-950 mr-2" aria-hidden="true" />}
                <span className={x?.name === chain?.name ? 'text-gray-950' : ''}>{x?.name}</span>
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
