import type {
  Unsubcall,
  InjectedAccountWithMeta,
} from '@polkadot/extension-inject/types';

export async function loadAccounts({
  appName,
  subscribe,
  ss58Format,
}: {
  appName: string;
  subscribe: (accounts: InjectedAccountWithMeta[]) => void;
  ss58Format?: number;
}): Promise<Unsubcall | void> {
  // we have to load this async so references to window don't break server rendered apps
  const { web3Enable, web3AccountsSubscribe } = await import(
    '@polkadot/extension-dapp'
  );

  await web3Enable(appName);

  return web3AccountsSubscribe(subscribe, { ss58Format });
}
