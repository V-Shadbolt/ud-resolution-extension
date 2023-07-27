import Resolution from "@unstoppabledomains/resolution";
import { udResolverKeys } from '@unstoppabledomains/tldsresolverkeys';

const SINGLE_ADDRESS_LIST = 'SINGLE';
const MULTI_ADDRESS_LIST = 'MULTI';

const infuraKey = '79ad8b119a4145ac8525b66fe16890ae'//process.env.REACT_APP_INFURA_KEY!

const udResolutionInstance = new Resolution({
  sourceConfig: {
    uns: {
      locations: {
        Layer1: {
          url: `https://mainnet.infura.io/v3/${infuraKey}`,
          network: "mainnet",
        },
        Layer2: {
          url: `https://polygon-mainnet.infura.io/v3/${infuraKey}`,
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

export async function resolveSingleAddressUns(unsName: any, symbol: any) {
  const address = await udResolutionInstance
    .addr(unsName, symbol)
    .catch((err) => {
      return errorHandling(err.code)
    });
  return address;
}
  
export async function resolveMultiAddressUns(unsName: any, symbol: any, version: any) {
  const address = await udResolutionInstance
    .multiChainAddr(unsName, symbol, version)
    .catch((err) => {
      return errorHandling(err.code)
    });
  return address;
}

export async function reverseResolution(address: string) {
  const domainName = await udResolutionInstance
    .reverse(address)
    .catch((err) => {
      return errorHandling(err.code)
    });
  return domainName;
}

export async function isValidUnstoppableDomainName(domain: string) {
  let isValidUD = false
  isValidUD = await udResolutionInstance
      .isSupportedDomain(domain)
      .catch(() => {
          return false
      });

  return isValidUD;
}

export function determineAddressType(asset: string) {
  return udResolverKeys.singleAddressList.includes(asset)
      ? SINGLE_ADDRESS_LIST
      : MULTI_ADDRESS_LIST;
}


function errorHandling(error: string) {
let messaging = ""
if (error === "UnregisteredDomain") {
    messaging = "Err: Domain is not registered"
} else if (error === "RecordNotFound") {
    messaging = "Err: Crypto record is not found (or empty)"
} else if (error === "UnspecifiedResolver") {
    messaging = "Err: Domain is not configured (empty resolver)"
} else if (error === "UnsupportedDomain") {
    messaging = "Err: Domain is not supported"
} else {
    messaging = "Err: An unknown issue occured: " + error
}

return messaging
}
