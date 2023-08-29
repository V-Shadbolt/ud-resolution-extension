import punycode from 'punycode';
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

export function isValidDomainName(domain: string) {
  const match = punycode
    .toASCII(domain)
    .toLowerCase()
    // Checks that the domain consists of at least one valid domain pieces separated by periods, followed by a tld
    // Each piece of domain name has only the characters a-z, 0-9, and a hyphen (but not at the start or end of chunk)
    // A chunk has minimum length of 1, minimum tld is set to 1
    .match(
      /^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9]*[-a-z0-9]$/u,
    );
  return match !== null;
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
    messaging = "Err: This domain doesn't have an address for this token. Let the owner know to add one!"
} else {
    messaging = "Err: An unknown issue occured: " + error
}

return messaging
}
