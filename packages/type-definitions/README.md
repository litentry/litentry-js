# @litentry/type-definitions

Litenry Type Definitions for use with [`@polkadot/api`](https://www.npmjs.com/package/@polkadot/api).

## Usage

```js
import typeDefinitions from '@litentry/typeDefinitions';
import { WsProvider, ApiRx } from '@polkadot/api';

const provider = new WsProvider('wss://parachain.litentry.io');

ApiRx.create({
  provider,
  ...typeDefinitions,
}).subscribe((api) => {
  // use the API
});
```
