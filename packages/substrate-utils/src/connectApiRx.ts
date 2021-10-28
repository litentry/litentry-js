import { ApiRx } from '@polkadot/api';
import type { ApiOptions } from '@polkadot/api/types';

export function connectApiRx({
  apiOptions,
  onConnected,
  onReady,
  onDisconnected,
  onError,
}: {
  apiOptions: ApiOptions;
  onReady: (api: ApiRx) => void;
  onConnected?: (api: ApiRx) => void;
  onDisconnected?: () => void;
  onError?: (err: unknown) => void;
}): void {
  const api = new ApiRx(apiOptions);

  api.on('connected', () => {
    onConnected && onConnected(api);

    api.isReady.subscribe(() => onReady(api));
  });

  api.on('ready', () => onReady(api));

  api.on('disconnected', () => {
    onDisconnected && onDisconnected();
  });

  api.on('error', (err: unknown) => onError && onError(err));
}
