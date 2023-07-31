import { useNetwork, useSwitchNetwork, useAccount } from 'wagmi'

export function SwitchNetwork() {
  const { chain } = useNetwork()
  const { chains, switchNetwork } =
    useSwitchNetwork()
  const { isConnected } = useAccount()

  const handleNetworkChange = (e: any) => {
    const i = chains.findIndex(chain => chain?.name === e.target.value);
    if (i > -1) {
        switchNetwork?.(chains[i]?.id)
    }
  };

  return (
    <>
    {isConnected && (
    <div className='pr-4'>
      <select 
        className='inline-block rounded-lg bg-[#0D67FE] px-3 text-sm text-white tracking-tight font-normal font-roboto h-[39px] w-[120px]' 
        value={chain?.name} 
        onChange={handleNetworkChange}
        >
            {chains.map((x) => (
                <option value={x.name} key={x.id}>
                    {x.name}
                </option>
            ))}
      </select>
    </div>
    )}
    </>
  )
}
