import type { ApiOptions } from '@polkadot/api/types';
import type {
  Unsubcall,
  InjectedAccountWithMeta,
} from '@polkadot/extension-inject/types';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { ApiRx } from '@polkadot/api';
import { connectApiRx, loadAccounts } from '@litentry/substrate-utils';

const INITIAL_STATE: State = {
  api: null,
  apiError: null,
  apiState: null,
  accounts: null,
  extensionError: null,
  extensionState: null,
};

type SubstrateProviderProps = {
  apiOptions: ApiOptions;
  children: ReactNode;
  appName?: string;
  loadDevelopmentAccounts?: boolean;
  network?: string;
  ss58Format?: number;
};

enum ApiState {
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  INITIALISED = 'INITIALISED',
  READY = 'READY',
}

enum ExtensionState {
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
  EXTENSION_INIT = 'EXTENSION_INIT',
  EXTENSION_READY = 'EXTENSION_READY',
  EXTENSION_ERROR = 'EXTENSION_ERROR',
}

type Action =
  | { type: ActionType.API_CONNECT; payload: ApiRx }
  | { type: ActionType.API_DISCONNECT }
  | { type: ActionType.API_ERROR; payload: unknown }
  | { type: ActionType.API_INIT }
  | { type: ActionType.API_READY }
  | { type: ActionType.EXTENSION_ERROR; payload: unknown }
  | { type: ActionType.EXTENSION_INIT }
  | { type: ActionType.EXTENSION_READY; payload: InjectedAccountWithMeta[] };

type State = {
  api: ApiRx | null;
  apiError: unknown | null;
  apiState: ApiState | null;
  accounts: InjectedAccountWithMeta[] | null;
  extensionError: unknown | null;
  extensionState: ExtensionState | null;
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

    case ActionType.EXTENSION_INIT:
      return { ...state, extensionState: ExtensionState.LOADING };

    case ActionType.EXTENSION_READY:
      return {
        ...state,
        accounts: action.payload,
        extensionState: ExtensionState.READY,
      };

    case ActionType.EXTENSION_ERROR:
      return {
        ...state,
        extensionState: ExtensionState.ERROR,
        extensionError: action.payload,
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
  ss58Format,
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

    if (!state.extensionState) {
      dispatch({ type: ActionType.EXTENSION_INIT });

      loadAccounts({
        appName,
        ss58Format,
        subscribe: (accounts) =>
          dispatch({ type: ActionType.EXTENSION_READY, payload: accounts }),
      })
        .then((_unsub) => (unsub = _unsub))
        .catch((err) =>
          dispatch({ type: ActionType.EXTENSION_ERROR, payload: err })
        );
    }

    return () => {
      unsub && unsub();
    };
  }, [state.extensionState]);

  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  );
}

export function useSubstrateContext(): State {
  return useContext(SubstrateContext);
}
