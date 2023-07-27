import {
    useAccount,
    useDisconnect,
    useEnsName,
  } from 'wagmi'
import { Web3Button } from '@web3modal/react'
import { reverseResolution } from './Resolution'
import { useEffect } from 'react'
import { useLocalStorage } from './utils'
import { useDebounce } from 'use-debounce'
  
  export function Profile() {
    const { address, isConnected } = useAccount()
    const { data: ensName } = useEnsName({ address, chainId: 1, })
    const [unsName, setUnsName] = useLocalStorage('domain', '');
    const [debouncedEnsName] = useDebounce(ensName, 500)
    const { disconnect } = useDisconnect()

    const logout = () => {
      disconnect();
      setUnsName('');
    }

    useEffect(() => {
      const getUns = async () => {
        if (address) {
          const unsName = await reverseResolution(address);
          setUnsName(unsName)
        }
      }

      getUns()
  }, [address]);

    const domain = unsName ? unsName : debouncedEnsName ? debouncedEnsName : null
  
    if (isConnected) {
      return (
        <div className='max-w-[300px]'>
          <button className='inline-block rounded-lg bg-[#3596FF] px-3 text-lg text-white tracking-tight font-normal font-roboto max-w-[256px] w-auto min-h-[39px] h-auto' onClick={logout}>{domain ?? address}</button>
        </div>
      )
    }
    return (
      <Web3Button />
    )
  }
  