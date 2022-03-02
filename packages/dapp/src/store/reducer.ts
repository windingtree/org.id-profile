import type { Reducer } from 'react';
import type { Action, State, GenericStateRecord } from './actions';
import { useReducer } from 'react';
import Logger from '../utils/logger';
import { getState, storageReducer } from './localStorage';
import { ThemeMode } from '../components/SwitchThemeMode';

// Initialize logger
const logger = Logger('Reducer');

export const mainReducer = (state: State, action: Action): State => {
  logger.debug('Dispatch', action);
  let records: GenericStateRecord[];
  const type = action.type;

  try {
    switch (type) {
      case 'SET_CONNECTING':
        return {
          ...state,
          isConnecting: action.payload
        };
      case 'SET_ACCOUNT':
        return {
          ...state,
          account: action.payload
        };
      case 'SET_IS_RIGHT_NETWORK':
        return {
          ...state,
          isRightNetwork: action.payload
        };
      case 'SET_THEME_MODE':
        return {
          ...state,
          themeMode: action.payload
        };
      case 'SET_NETWORK_ID':
        return {
          ...state,
          networkId: action.payload
        };
      case 'SET_PROVIDER':
        return {
          ...state,
          provider: action.payload
        };
      case 'SET_INJECTED_PROVIDER':
        return {
          ...state,
          injectedProvider: action.payload
        };
      case 'SET_WEB3MODAL_FUNCTIONS':
        return {
          ...state,
          signIn: action.payload.signIn,
          logout: action.payload.logout
        };
      case 'SET_IPFS_NODE_CONNECTING':
        return {
          ...state,
          isIpfsNodeConnecting: action.payload
        };
      case 'SET_IPFS_NODE':
        return {
          ...state,
          ipfsNode: action.payload.ipfsNode,
          startIpfsNode: action.payload.startIpfsNode,
          stopIpfsNode: action.payload.stopIpfsNode
        };
      case 'SET_RECORD':
        if (!action.payload.name) {
          throw new Error(`State record name must be provided with a payload`);
        }
        if (typeof action.payload.record !== 'object') {
          throw new Error(`State record name must be provided with a payload`);
        }
        if (!action.payload.record.id) {
          throw new Error(`State record name must have Id property defined`);
        }
        // Add or update a record
        records = state[action.payload.name] as GenericStateRecord[];
        const knownRecord = records.filter(
          (r: GenericStateRecord) => r.id === action.payload.record.id
        )[0] || {};
        const restRecords = records.filter(
          (r: GenericStateRecord) => r.id !== action.payload.record.id
        );
        return {
          ...state,
          [action.payload.name]: [
            ...restRecords,
            ...[
              {
                ...knownRecord,
                ...action.payload.record
              }
            ]
          ]
        };
      case 'REMOVE_RECORD':
        if (!action.payload.name) {
          throw new Error(`State record name must be provided with a payload`);
        }
        if (!action.payload.id) {
          throw new Error(`State record Id must be provided with a payload`);
        }
        // Remove record
        records = state[action.payload.name] as GenericStateRecord[];
        return {
          ...state,
          [action.payload.name]: records.filter(
            (r: GenericStateRecord) => r.id !== action.payload.id
          )
        };
      case 'ERROR_ADD':
        return {
          ...state,
          errors: [
            ...state.errors,
            action.payload
          ]
        };
      case 'ERROR_REMOVE':
        return {
          ...state,
          errors: state.errors.filter((e, i) => i !== action.payload)
        };
      case 'ERROR_REMOVE_ALL':
        return {
          ...state,
          errors: []
        };
      default:
        throw new Error(`Unknown state action type: ${type}`);
    }
  } catch(error) {
    logger.error((error as Error).message || 'Unknown state reducer error');
    return state;
  }
};

const initialState: State = {
  isConnecting: false,
  isRightNetwork: true,
  isIpfsNodeConnecting: false,
  signIn: () => {},
  logout: () => {},
  errors: [],
  themeMode:ThemeMode.light,
  startIpfsNode: () => {},
  stopIpfsNode: () => {},
  keys: [],
  resolverHistory: []
};

export const combineReducers = (
  reducers: Reducer<State, Action>[]
): Reducer<State, Action> =>
  (state: State, action: Action): State => {
    let updatedState = state;

    for (const reducer of reducers) {
      updatedState = reducer(updatedState, action);
    }

    return updatedState;
  };

export const useAppReducer = () => {
  const storedState = getState(); // Restoration of the Dapp state

  return useReducer(
    combineReducers(
      [
        mainReducer,
        storageReducer() // Always must be the last
      ]
    ),
    {
      ...initialState,
      ...storedState
    }
  );
};
