# useKeysManager react hook

- Keys management API is a React hook `useKeysManager`. This hook returns `[keys, add, update, remove, revoke, loading, error]` as hook parameters:
    - `addKey(record: KeyRecord)` is an async function that allows registering keys
    - `updateKey(record: KeyRecord)` is an async function that allows updating existing key
    - `removeKey(tag: string)` is an async function that allows removing existing keys
    - `revokeKey(tag: string, reason: string)` is an async function that allows revoking existing keys
    - `loading` is a dynamic boolean value that indicates that the registered keys list is reloading
    - `error` is a dynamic property that refers to internal hook errors, the default value is `undefined`

### Usage in a component:

```typescript
export const myComponent = () => {
  const [
    addKey,
    updateKey,
    removeKey,
    revokeKey,
    loading,
    error
  ] = useKeysManager();

  return (
    <Button onClick=() => addKey(RawKeyRecord)>
      Add key
    </Button>
  );
};
```
