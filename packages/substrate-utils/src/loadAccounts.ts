import type { Unsubcall } from '@polkadot/extension-inject/types';
import keyring, { Keyring } from '@polkadot/ui-keyring';

export async function loadAccounts({
  appName,
  loadDevelopmentAccounts,
  subscribe,
}: {
  appName: string;
  loadDevelopmentAccounts: boolean;
  subscribe: (keyring: Keyring) => void;
}): Promise<Unsubcall | void> {
  // we have to load this async so references to window don't break server rendered apps
  const { web3Enable, web3AccountsSubscribe } = await import(
    '@polkadot/extension-dapp'
  );

  await web3Enable(appName);

  return web3AccountsSubscribe((allAccounts) => {
    keyring.loadAll({ isDevelopment: loadDevelopmentAccounts }, allAccounts);
    subscribe(keyring);
  });
}
