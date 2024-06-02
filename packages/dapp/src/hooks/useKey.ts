import type { KeyRecord } from '../store/actions';
import type { JsonRpcSigner } from '@ethersproject/providers';
import { useState, useMemo, useEffect } from 'react';
import { findKeyById, findKeyByTag } from './useKeysManager';
import { useAppState } from '../store';
import Logger from '../utils/logger';

// Initialize logger
const logger = Logger('useKeysManager');
const UNKNOWN_ERROR = 'Unknown useKeysManager error';

export type UseKeyHook = [
  key: KeyRecord | undefined,
  signer: JsonRpcSigner | undefined,
  isConnected: boolean,
  error: string | undefined,
];

// UseKey react hook
export const useKey = (
  keyIdOrTag: string
): UseKeyHook => {
  const { keys, provider, account } = useAppState();

  const [key, setKey] = useState<KeyRecord | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const isConnected = useMemo(
    () => key !== undefined && key.publicKey === account,
    [key, account]
  )

  useEffect(() => {
    try {
      let newKey = findKeyById(keys, keyIdOrTag) ?? findKeyByTag(keys, keyIdOrTag)
      if (newKey === undefined) {
        throw new Error('Key not found');
      }
      setKey(newKey)
    } catch(error) {
      logger.error(error);
      setError((error as Error).message || UNKNOWN_ERROR);
    }
  }, [keys, keyIdOrTag])

  const signer = useMemo(() => {
    try {
      if (key === undefined) {
        throw new Error('Key undefined');
      }
      if (!isConnected) {
        throw new Error('Key is not selected');
      }
      if (provider === undefined) {
        throw new Error('Web3 provider undefined');
      }

      const signer = provider.getSigner(key.publicKey)
      return signer
    } catch(error) {
      logger.error(error);
      setError((error as Error).message || UNKNOWN_ERROR);
      return undefined
    }
  }, [key, provider]);

  return [key, signer, isConnected, error];
};
