import './App.css';
import { SendTransaction } from './SendTransaction';
import { SwitchNetwork } from './SwitchNetwork';
import { Profile } from './Profile';

function App() {
    
  return (
      <div className="mx-auto h-[600px] w-[400px] px-3 py-3 bg-slate-500">
        <div id='Connection' className='flex flex-row justify-center items-center pb-3'>
          <SwitchNetwork />
          <Profile />
        </div>
        <div className=''>
          <SendTransaction />
        </div>
      </div>
  );
}

export default App;
