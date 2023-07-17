import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { resolveMultiAddressUns, resolveSingleAddressUns } from './Resolution';

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
  //const inputCurrency = useInput();
  const [address, setAddress] = useState("")
  const [currency, setCurrency] = useState("ETH");

  const handleCurrencyChange = (e: any) => {
    setCurrency(e.target.value);
  };

  const resolution = async () => {
    let result
    if (currency === "ETH") {
      result = await resolveSingleAddressUns(inputDomain.value, currency)
    } else if (currency === "MATIC") {
      result = await resolveMultiAddressUns(inputDomain.value, currency, "ERC20")
    } else {
      result = ""
    }
    
    if (typeof result === "string")
      setAddress(result)
  }

  useEffect(() => {
    if (inputDomain.value) {
      resolution()
    }
}, [currency]);
    
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <input
          {...inputDomain}
          placeholder="UNS"
        />
        <label>
          Currency
          <select value={currency} onChange={handleCurrencyChange}>
            <option value="MATIC">MATIC</option>
            <option value="ETH">ETH</option>
          </select>
        </label>
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
