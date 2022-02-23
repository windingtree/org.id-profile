import type { ReactNode } from 'react';
import type { Web3ModalConfig } from '../hooks/useWeb3Modal';
import { createContext, useContext, useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useAppReducer } from './reducer';
import { assertNonNullish } from '../utils/types';

// Custom hooks
import { useWeb3Modal } from '../hooks/useWeb3Modal';
import { useNetworkId } from '../hooks/useNetworkId';
import { useAccount } from '../hooks/useAccount';
import { useIpfsNode } from '../hooks/useIpfsNode';

// Config
import {
  getNetworksIds,
  getNetworksRpcs
} from '../config';

export type AppReducerType = ReturnType<typeof useAppReducer>;
export type State = AppReducerType[0];
export type Dispatch = AppReducerType[1];

export const StateContext = createContext<State | null>(null);
export const DispatchContext = createContext<Dispatch | null>(null);

export interface PropsType {
  children: ReactNode;
}

export const useAppState = () => {
  const ctx = useContext(StateContext);
  assertNonNullish(ctx, 'Missing state context');

  return ctx;
};

export const useAppDispatch = () => {
  const ctx = useContext(DispatchContext);
  assertNonNullish(ctx, 'Missing dispatch context');

  return ctx;
}

const allowedNetworksIds = getNetworksIds();
const rpc = getNetworksRpcs();

// Web3Modal initialization
const web3ModalConfig: Web3ModalConfig = {
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc
      }
    }
  }
};

export const AppStateProvider = ({ children }: PropsType) => {
  const [state, dispatch] = useAppReducer();
  const [
    provider,
    injectedProvider,
    isConnecting,
    signIn,
    logout,
    web3ModalError
  ] = useWeb3Modal(web3ModalConfig);
  const [
    networkId,
    isNetworkIdLoading,
    isRightNetwork,
    networkError
  ] = useNetworkId(provider, allowedNetworksIds);
  const [account, isAccountLoading, accountError] = useAccount(provider);
  const [ipfsNode, startIpfsNode, stopIpfsNode, ipfsNodeLoading, ipfsNodeError] = useIpfsNode();

  useEffect(() => {
    if (web3ModalError) {
      dispatch({
        type: 'ERROR_ADD',
        payload: web3ModalError
      })
    }
    if (networkError) {
      dispatch({
        type: 'ERROR_ADD',
        payload: networkError
      })
    }
    if (accountError) {
      dispatch({
        type: 'ERROR_ADD',
        payload: accountError
      })
    }
    if (ipfsNodeError) {
      dispatch({
        type: 'ERROR_ADD',
        payload: ipfsNodeError
      })
    }
  }, [dispatch, web3ModalError, networkError, accountError, ipfsNodeError]);

  useEffect(() => {
    dispatch({
      type: 'SET_CONNECTING',
      payload: isConnecting || isNetworkIdLoading || isAccountLoading
    })
  }, [dispatch, isConnecting, isNetworkIdLoading, isAccountLoading]);

  useEffect(() => {
    dispatch({
      type: 'SET_IPFS_NODE_CONNECTING',
      payload: ipfsNodeLoading
    })
  }, [dispatch, ipfsNodeLoading]);

  useEffect(() => {
    dispatch({
      type: 'SET_ACCOUNT',
      payload: account
    })
  }, [dispatch, account]);

  useEffect(() => {
    dispatch({
      type: 'SET_IS_RIGHT_NETWORK',
      payload: isRightNetwork
    })
  }, [dispatch, isRightNetwork]);

  useEffect(() => {
    dispatch({
      type: 'SET_NETWORK_ID',
      payload: networkId
    })
  }, [dispatch, networkId]);

  useEffect(() => {
    dispatch({
      type: 'SET_PROVIDER',
      payload: provider
    })
  }, [dispatch, provider]);

  useEffect(() => {
    dispatch({
      type: 'SET_INJECTED_PROVIDER',
      payload: injectedProvider
    })
  }, [dispatch, injectedProvider]);

  useEffect(() => {
    dispatch({
      type: 'SET_WEB3MODAL_FUNCTIONS',
      payload: {
        signIn,
        logout
      }
    })
  }, [dispatch, signIn, logout]);

  useEffect(() => {
    dispatch({
      type: 'SET_IPFS_NODE',
      payload: {
        ipfsNode,
        startIpfsNode,
        stopIpfsNode
      }
    })
  }, [dispatch, ipfsNode, startIpfsNode, stopIpfsNode]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};
