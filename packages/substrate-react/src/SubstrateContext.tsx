import type { ApiOptions } from '@polkadot/api/types';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { ApiRx } from '@polkadot/api';
import { Keyring } from '@polkadot/ui-keyring';
import { connectApiRx, loadAccounts } from '@litentry/substrate-utils';

const INITIAL_STATE: State = {
  api: null,
  apiError: null,
  apiState: null,
  keyring: null,
  keyringError: null,
  keyringState: null,
};

type SubstrateProviderProps = {
  apiOptions: ApiOptions;
  children: ReactNode;
  appName?: string;
  loadDevelopmentAccounts?: boolean;
  network?: string;
};

enum ApiState {
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  INITIALISED = 'INITIALISED',
  READY = 'READY',
}

enum KeyringState {
  ERROR = 'ERROR',
  LOADING = 'LOADING',
  READY = 'READY',
}

enum ActionType {
  API_INIT = 'API_INIT',
  API_CONNECT = 'API_CONNECT',
  API_DISCONNECT = 'API_DISCONNECT',
  API_ERROR = 'API_ERROR',
  API_READY = 'API_READY',
  KEYRING_INIT = 'KEYRING_INIT',
  KEYRING_READY = 'KEYRING_READY',
  KEYRING_ERROR = 'KEYRING_ERROR',
}

type Action =
  | { type: ActionType.API_CONNECT; payload: ApiRx }
  | { type: ActionType.API_DISCONNECT }
  | { type: ActionType.API_ERROR; payload: unknown }
  | { type: ActionType.API_INIT }
  | { type: ActionType.API_READY }
  | { type: ActionType.KEYRING_ERROR; payload: unknown }
  | { type: ActionType.KEYRING_INIT }
  | { type: ActionType.KEYRING_READY; payload: Keyring };

type State = {
  api: ApiRx | null;
  apiError: unknown | null;
  apiState: ApiState | null;
  keyring: Keyring | null;
  keyringError: unknown | null;
  keyringState: KeyringState | null;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.API_INIT:
      return { ...state, apiState: ApiState.INITIALISED };

    case ActionType.API_CONNECT:
      return { ...state, api: action.payload, apiState: ApiState.CONNECTING };

    case ActionType.API_READY:
      return { ...state, apiState: ApiState.READY };

    case ActionType.API_DISCONNECT:
      return { ...state, apiState: ApiState.DISCONNECTED };

    case ActionType.API_ERROR:
      return { ...state, apiState: ApiState.ERROR, apiError: action.payload };

    case ActionType.KEYRING_INIT:
      return { ...state, keyringState: KeyringState.LOADING };

    case ActionType.KEYRING_READY:
      return {
        ...state,
        keyring: action.payload,
        keyringState: KeyringState.READY,
      };

    case ActionType.KEYRING_ERROR:
      return {
        ...state,
        keyringState: KeyringState.ERROR,
        keyringError: action.payload,
      };

    default:
      return state;
  }
};

export const SubstrateContext = createContext<State>(INITIAL_STATE);

export function SubstrateProvider({
  children,
  apiOptions,
  appName = 'Litentry dApp',
  loadDevelopmentAccounts = false,
}: SubstrateProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    if (!state.apiState) {
      dispatch({ type: ActionType.API_INIT });

      connectApiRx({
        apiOptions,
        onConnected: (api) =>
          dispatch({ type: ActionType.API_CONNECT, payload: api }),
        onReady: () => dispatch({ type: ActionType.API_READY }),
        onDisconnected: () => dispatch({ type: ActionType.API_DISCONNECT }),
        onError: (err) =>
          dispatch({ type: ActionType.API_ERROR, payload: err }),
      });
    }
  }, [state.apiState]);

  useEffect(() => {
    let unsub: Unsubcall | void;

    if (!state.keyringState) {
      dispatch({ type: ActionType.KEYRING_INIT });

      loadAccounts({
        appName,
        loadDevelopmentAccounts,
        subscribe: (keyring) =>
          dispatch({ type: ActionType.KEYRING_READY, payload: keyring }),
      })
        .then((_unsub) => (unsub = _unsub))
        .catch((err) =>
          dispatch({ type: ActionType.KEYRING_ERROR, payload: err })
        );
    }

    return () => {
      unsub && unsub();
    };
  }, [state.keyringState]);

  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  );
}

export function useSubstrateContext(): State {
  return useContext(SubstrateContext);
}
