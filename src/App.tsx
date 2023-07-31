import './App.css';
import { SendTransaction } from './SendTransaction';
import { SwitchNetwork } from './SwitchNetwork';
import { Profile } from './Profile';
import udLogo from "./assets/ud-logo-lockup.svg"

function App() {
    
  return (
      <div className="flex flex-col mx-auto px-3 py-3 h-[550px] w-[350px] bg-[#F5F5F5]">
        <img className="relative mx-auto pt-0 h-auto w-[50%]" src={udLogo} alt="udlogo"/>
        <div id='Connection' className='flex flex-row justify-center items-center pb-3 pt-3 h-[100px]'>
          <SwitchNetwork />
          <Profile />
        </div>
        <div className='relative justify-center items-center h-[550px]'>
          <SendTransaction />
        </div>
        <div className='relative justify-center text-center bottom-0 pt-3 underline text-sm text-[#0D67FE]'>
          <a
          href="https://unstoppabledomains.com/"
          target="_blank" rel="noopener noreferrer"
          >
            Buy a Web3 Domain
          </a>
        </div>
      </div>
  );
}

export default App;
