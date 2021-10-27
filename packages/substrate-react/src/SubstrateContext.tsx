import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react';
import { ApiRx } from '@polkadot/api';
import type { ApiOptions } from '@polkadot/api/types';
import keyring, { Keyring } from '@polkadot/ui-keyring';

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
  KEYRING_LOAD = 'KEYRING_LOAD',
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
  | { type: ActionType.KEYRING_LOAD }
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

    case ActionType.KEYRING_LOAD:
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

function connectApi(
  state: State,
  dispatch: Dispatch<Action>,
  apiOptions: ApiOptions
): void {
  const { apiState } = state;

  if (apiState) return;

  dispatch({ type: ActionType.API_INIT });

  const api = new ApiRx(apiOptions);

  api.on('connected', () => {
    dispatch({ type: ActionType.API_CONNECT, payload: api });

    api.isReady.subscribe(() => dispatch({ type: ActionType.API_READY }));
  });

  api.on('ready', () => dispatch({ type: ActionType.API_READY }));

  api.on('disconnected', () => dispatch({ type: ActionType.API_DISCONNECT }));

  api.on('error', (err: unknown) =>
    dispatch({ type: ActionType.API_ERROR, payload: err })
  );
}

function loadAccounts(
  state: State,
  dispatch: Dispatch<Action>,
  appName: string,
  loadDevelopmentAccounts: boolean
): void {
  const asyncLoadAccounts = async () => {
    dispatch({ type: ActionType.KEYRING_LOAD });
    try {
      const { web3Enable, web3AccountsSubscribe } = await import(
        '@polkadot/extension-dapp'
      );

      await web3Enable(appName);

      web3AccountsSubscribe((allAccounts) => {
        keyring.loadAll(
          { isDevelopment: loadDevelopmentAccounts },
          allAccounts
        );
        dispatch({ type: ActionType.KEYRING_READY, payload: keyring });
      });
    } catch (e) {
      dispatch({ type: ActionType.KEYRING_ERROR, payload: e });
    }
  };

  const { keyringState } = state;
  if (keyringState) return;

  asyncLoadAccounts();
}

export const SubstrateContext = createContext<State>(INITIAL_STATE);

export function SubstrateProvider({
  children,
  apiOptions,
  appName = 'Litentry dApp',
  loadDevelopmentAccounts = false,
}: SubstrateProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  connectApi(state, dispatch, apiOptions);
  loadAccounts(state, dispatch, appName, loadDevelopmentAccounts);

  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  );
}

export function useSubstrateContext(): State {
  return useContext(SubstrateContext);
}
