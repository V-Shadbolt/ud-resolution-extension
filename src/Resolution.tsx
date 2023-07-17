import Resolution from "@unstoppabledomains/resolution";
import errorHandling from "./errorHandling";

export async function resolveSingleAddressUns(unsName: any, symbol: any) {
    const udResolutionInstance = new Resolution({
        sourceConfig: {
          uns: {
            locations: {
              Layer1: {
                url: "https://mainnet.infura.io/v3/79ad8b119a4145ac8525b66fe16890ae",
                network: "mainnet",
              },
              Layer2: {
                url: "https://polygon-mainnet.infura.io/v3/79ad8b119a4145ac8525b66fe16890ae",
                network: "polygon-mainnet",
              },
            },
          },
          zns: {
            url: "https://api.zilliqa.com",
            network: "mainnet",
          },
        },
      });
    const address = await udResolutionInstance
      .addr(unsName, symbol)
      .catch((err) => {
        return errorHandling(err.code)
      });
    return address;
  }
  
  export async function resolveMultiAddressUns(unsName: string, symbol: string, version: string) {
    const udResolutionInstance = new Resolution({
        sourceConfig: {
          uns: {
            locations: {
              Layer1: {
                url: "https://mainnet.infura.io/v3/79ad8b119a4145ac8525b66fe16890ae",
                network: "mainnet",
              },
              Layer2: {
                url: "https://polygon-mainnet.infura.io/v3/79ad8b119a4145ac8525b66fe16890ae",
                network: "polygon-mainnet",
              },
            },
          },
          zns: {
            url: "https://api.zilliqa.com",
            network: "mainnet",
          },
        },
      });
    const address = await udResolutionInstance
      .multiChainAddr(unsName, symbol, version)
      .catch((err) => {
        console.log(err);
      });
    return address;
  }
  
  export async function reverseResolution(address: string) {
    const udResolutionInstance = new Resolution({
        sourceConfig: {
          uns: {
            locations: {
              Layer1: {
                url: "https://mainnet.infura.io/v3/79ad8b119a4145ac8525b66fe16890ae",
                network: "mainnet",
              },
              Layer2: {
                url: "https://polygon-mainnet.infura.io/v3/79ad8b119a4145ac8525b66fe16890ae",
                network: "polygon-mainnet",
              },
            },
          },
          zns: {
            url: "https://api.zilliqa.com",
            network: "mainnet",
          },
        },
      });
    const domainName = await udResolutionInstance
      .reverse(address)
      .catch((err) => {
        console.log(err);
      });
    return domainName;
  }