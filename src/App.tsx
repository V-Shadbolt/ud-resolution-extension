import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { resolveSingleAddressUns } from './Resolution';

function useInput() {
  const [value, setValue] = useState("");
  function onChange(e: any) {
    setValue(e.target.value);
  }
  return {
    value,
    onChange,
  };
}

function App() {
  const inputDomain = useInput();
  const inputCurrency = useInput();
  const [address, setAddress] = useState("")

  const resolution = async () => {
    const result = await resolveSingleAddressUns(inputDomain.value, inputCurrency.value)
    if (typeof result === "string")
      setAddress(result)
  }
    
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <input
          {...inputDomain}
          placeholder="Type Unstoppable Domain here"
        />
        <input
          {...inputCurrency}
          placeholder="Type currency here (ETH, USDT, ...)"
        />
        <p>{address}</p>
        <button onClick={resolution}>Resolve</button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
