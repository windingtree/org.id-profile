import type { AnySchema } from '@windingtree/org.id-utils/dist/object';
import type { KeyRecordRaw, KeyRecord } from '../store/actions';
import { useState, useCallback, useEffect } from 'react';
import { object, uid } from '@windingtree/org.id-utils';
import { org } from '@windingtree/org.json-schema';
import { useAppDispatch, useAppState } from '../store';
import Logger from '../utils/logger';

// Initialize logger
const logger = Logger('useKeysManager');
const UNKNOWN_ERROR = 'Unknown useKeysManager error';

export const revocationReasonValues = object
  .getDeepValue(
    org,
    'definitions.VerificationMethodRevocationReason.properties.reason.enum'
  ) as string[];

export type RevocationReason = typeof revocationReasonValues[number];

export const allowedKeysTypes: string[] = ['EcdsaSecp256k1VerificationKey2019'];

export type KeyType =
	typeof allowedKeysTypes[number];

export type Keys = KeyRecord[];

export type UseKeysManagerHook = [
  addKey: (record: KeyRecordRaw) => Promise<string | undefined>,
  updateKey: (record: KeyRecord) => void,
  removeKey: (tag: string) => void,
  revokeKey: (tag: string, reason:RevocationReason) => void,
  loading: boolean,
  error: string | undefined,
];

export const keyRecordSchema: AnySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: allowedKeysTypes
    },
    publicKey: {
      type: 'string'
    },
    tag: {
      type: 'string'
    },
    note: {
      type: 'string'
    },
    revocation: {
      type: 'object',
      properties:{
        reason: {
          type: 'string',
          enum: revocationReasonValues
        },
        invalidityDate: {
          type: 'string',
          format: 'date-time'
        },
      },
      required: ['reason', 'invalidityDate']
    }
  },
  required: ['id', 'type', 'publicKey', 'tag']
}

const validateKeyWithSchema = (record: KeyRecord): string | null =>
  object.validateWithSchemaOrRef(
    keyRecordSchema,
    '',
    record
  );

export const findKeyById = (keys: KeyRecord[], id: string): KeyRecord | undefined =>
  keys.find((key) => key.id === id);

export const findKeyByTag = (keys: KeyRecord[], tag: string): KeyRecord | undefined =>
  keys.find((key) => key.tag === tag);

// UseKeysManager react hook
export const useKeysManager = (): UseKeysManagerHook => {
  const { keys } = useAppState();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(false);
    setError(undefined);
  }, [keys])

  const addKey = useCallback(
    async (rawRecord: KeyRecordRaw): Promise<string | undefined> => {
      try {
        setLoading(true);
        const record = {
          ...rawRecord,
          id: uid.simpleUid(8)
        } as KeyRecord;

        const validationResult = validateKeyWithSchema(record);

        if (validationResult !== null) {
          throw new Error(`Validation error: ${validationResult}`);
        }

        let tagExist = findKeyByTag(keys, record.tag);

        if (tagExist !== undefined) {
          throw new Error('Provided tag already used, pick another one');
        }

        dispatch({
          type: 'SET_RECORD',
          payload: {
            name: 'keys',
            record
          }
        });
        return record.id
      } catch(error) {
        logger.error(error);
        setError((error as Error).message || UNKNOWN_ERROR);
        setLoading(false);
      }
    },
    [dispatch, setLoading, setError, keys]
  );

  const updateKey = useCallback(
    (record: KeyRecord): void => {
      try{
        setLoading(true);
        const validationResult = validateKeyWithSchema(record);

        if (validationResult !== null) {
          throw new Error(`Validation error: ${validationResult}`);
        }

        let keyExist = findKeyById(keys, record.id);

        if (keyExist === undefined) {
          throw new Error('Provided key not found');
        }

        dispatch({
          type: 'SET_RECORD',
          payload: {
            name: 'keys',
            record
          }
        });
      } catch(error) {
        logger.error(error);
        setError((error as Error).message || UNKNOWN_ERROR);
        setLoading(false);
      }
    },
    [dispatch, setLoading, setError, keys]
  );

  const removeKey = useCallback(
    (tag: string): void => {
      try {
        setLoading(true);
        let keyExist = findKeyByTag(keys, tag);

        if (keyExist === undefined) {
          throw new Error('Key with provided tag does not exist');
        }

        dispatch({
          type: 'REMOVE_RECORD',
          payload: {
            name: 'keys',
            id: keyExist.id
          }
        });
      } catch(error) {
        logger.error(error);
        setError((error as Error).message || UNKNOWN_ERROR);
        setLoading(false);
      }
    },
    [dispatch, setLoading, setError, keys]
  );

  const revokeKey = useCallback(
    (
      tag: string,
      reason: RevocationReason
    ): void => {
      try {
        setLoading(true);
        const keyExist = findKeyByTag(keys, tag);

        if (keyExist === undefined) {
          throw new Error('Key with provided tag does not exist');
        }

        dispatch({
          type: 'SET_RECORD',
          payload: {
            name: 'keys',
            record: {
              ...keyExist,
              revocation: {
                reason,
                invalidityDate: new Date().toISOString()
              }
            }
          }
        });
      } catch(error) {
        logger.error(error);
        setError((error as Error).message || UNKNOWN_ERROR);
        setLoading(false);
      }
    },
    [dispatch, setLoading, setError, keys]
  );

  return [addKey, updateKey, removeKey, revokeKey, loading, error];
};
