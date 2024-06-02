import type { Web3ModalProvider } from '../hooks/useWeb3Modal';
import type { KeyType } from '../hooks/useKeysManager';
import type { IPFS } from '@windingtree/ipfs-apis';
import type { IProviderInfo } from 'web3modal';
import type { VerificationMethodReference } from '@windingtree/org.json-schema/types/org.json';
import type { DidResolutionResponse } from '@windingtree/org.id-resolver';
import { ThemeMode } from '../components/SwitchThemeMode';

export interface GenericStateRecord {
  id: string;
  [key: string]: unknown;
}

export interface KeyRecord extends GenericStateRecord {
  type: KeyType;
	publicKey: string; // Ethereum account address
	tag: string; // Unique across records formatted string
	note?: string; // Key description
	revocation?: VerificationMethodReference['verificationMethodRevocation'];
}

export interface KeyRecordRaw extends Omit<KeyRecord, 'id'> {};

export type ResolutionResult =
	| 'OK'
	| 'ERROR';

export interface ResolverHistoryRecord extends GenericStateRecord {
	name: string;
	date: string; // date-time ISO
  did: string;
	result: ResolutionResult;
	report: DidResolutionResponse;
}

export interface ResolverHistoryRecordRaw extends Omit<ResolverHistoryRecord, 'id'> {};

export interface State {
  isConnecting: boolean;
  networkId?: number;
  isRightNetwork: boolean;
  provider?: Web3ModalProvider;
  injectedProvider?: IProviderInfo;
  account?: string;
  signIn: Function;
  signOut: Function;
  errors: string[];
  themeMode: ThemeMode;
  ipfsNode?: IPFS;
  isIpfsNodeConnecting: boolean;
  startIpfsNode: Function;
  stopIpfsNode: Function;
  keys: KeyRecord[];
  resolverHistory: ResolverHistoryRecord[];
  [key: string]: unknown | GenericStateRecord[];
}

export interface SetConnectingAction {
  type: 'SET_CONNECTING',
  payload: boolean;
}

export interface SetAccountAction {
  type: 'SET_ACCOUNT',
  payload: string | undefined;
}

export interface SetIsRightNetworkAction {
  type: 'SET_IS_RIGHT_NETWORK',
  payload: boolean;
}

export interface SetNetworkIdAction {
  type: 'SET_NETWORK_ID',
  payload: number | undefined;
}

export interface SetProviderAction {
  type: 'SET_PROVIDER',
  payload: Web3ModalProvider | undefined;
}

export interface SetInjectedProviderAction {
  type: 'SET_INJECTED_PROVIDER',
  payload: IProviderInfo | undefined;
}

export interface SetWeb3modalFunctionsAction {
  type: 'SET_WEB3MODAL_FUNCTIONS',
  payload: {
    signIn: Function;
    signOut: Function;
  }
}

export interface AddErrorAction {
  type: 'ERROR_ADD';
  payload: string;
}

export interface RemoveErrorAction  {
  type: 'ERROR_REMOVE';
  payload: number;
}

export interface RemoveAllErrorsAction {
  type: 'ERROR_REMOVE_ALL';
  payload: number;
}

export interface SetThemeModeAction {
  type: 'SET_THEME_MODE';
  payload: ThemeMode;
}

export interface SetIpfsNodeConnectingAction {
  type: 'SET_IPFS_NODE_CONNECTING';
  payload: boolean;
}

export interface SetIpfsNodeAction {
  type: 'SET_IPFS_NODE';
  payload: {
    ipfsNode: IPFS | undefined;
    startIpfsNode: Function;
    stopIpfsNode: Function;
  }
}

export interface SetRecordAction {
  type: 'SET_RECORD',
  payload: {
    name: string,
    record: GenericStateRecord
  }
}

export interface RemoveRecordAction {
  type: 'REMOVE_RECORD',
  payload: {
    name: string,
    id: string
  }
}

export type Action =
| SetConnectingAction
| SetAccountAction
| SetIsRightNetworkAction
| SetNetworkIdAction
| SetProviderAction
| SetThemeModeAction
| SetInjectedProviderAction
| SetWeb3modalFunctionsAction
| SetIpfsNodeConnectingAction
| SetIpfsNodeAction
| SetRecordAction
| RemoveRecordAction
| AddErrorAction
| RemoveErrorAction
| RemoveAllErrorsAction;
