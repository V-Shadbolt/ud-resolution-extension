import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {
  lightTheme,
  RainbowKitProvider,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  trustWallet,
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  braveWallet,
  coinbaseWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { publicProvider } from 'wagmi/providers/public';
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'

const chains = [mainnet, polygon]
const projectId = 'f0b8d1f9d2e1714f1703b845f015363f'//process.env.REACT_APP_WCV2_PROJECT_ID!

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({
        projectId,
        chains,
      }),
      trustWallet({
        projectId,
        chains,
      }),
      braveWallet({
        chains,
      }),
      injectedWallet({ chains }),
      coinbaseWallet({
        appName: 'Unstoppable Domains Extension',
        chains,
      }),
      rainbowWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
      phantomWallet({
        chains,
      }),
    ],
  },
]);

const { publicClient } = configureChains(chains, [publicProvider()])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
      chains={chains} 
      modalSize='compact'
      theme={lightTheme({
        accentColor: '#0D67FE',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      })}
      >
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
