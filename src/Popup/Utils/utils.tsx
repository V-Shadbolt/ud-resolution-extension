import { useEffect, useState } from "react";

export const useLocalStorage = (
    storageKey: string,
    fallbackState: any
) => {
    
    localStorage[storageKey] ?? localStorage.setItem(storageKey, JSON.stringify(fallbackState));

    const [value, setValue] = useState(
        JSON.parse(localStorage.getItem(storageKey || "") || "") ?? fallbackState
      );
    
      useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }, [value, storageKey]);
    
      return [value, setValue];
};

export const truncate = (string: string) => {
  const maxLength = 24
  if (string.length > maxLength) {
    return string.substring(0, 10) + '...' + string.substring(string.length-10);
  }
  return string
}