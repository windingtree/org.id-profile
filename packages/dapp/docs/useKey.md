# useKey react hook

Registered keys API is a React hook useKey. This hook accepts a keyId or tag as an input parameter and returns [key, signer, error] as hook parameters:
- `key` is a dynamic property with a key record
- `signer` is an `ethers.js` `signer` (can be obtained using provider.getSigner) for a selected key. If key is not currently selected in the Wallet this property must be `undefined`
- `isConnected` is a dynamic property key connection status
- `error` is a dynamic property that refers to internal hook errors, the default value is `undefined`

### Usage in a component:

```typescript
export const myComponent = () => {
  const[key, signer, isConnected, error] = useKey(keyIdOrTag);
};
```
