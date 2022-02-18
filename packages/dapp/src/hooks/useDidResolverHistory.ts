import type { AnySchema } from '@windingtree/org.id-utils/dist/object';
import type {
  GenericStateRecord,
  ResolverHistoryRecordRaw
} from '../store/actions';
import { useCallback, useEffect, useState } from 'react';
import resolutionResponseSchema from '@windingtree/org.id-resolver/dist/responseSchema.json';
import { object, uid } from '@windingtree/org.id-utils';
import { useAppDispatch, useAppState } from '../store';
import Logger from '../utils/logger';

// Initialize logger
const logger = Logger('useDidResolverHistory');

export type UseDidResolverHistoryHook = [
  add: (record: ResolverHistoryRecordRaw) => string | undefined,
  remove: (id: string) => string | undefined,
  loading: boolean,
  error: string | undefined,
];

export enum DidResolutionResult {
  Ok = 'OK',
  Error = 'ERROR'
}

export const historyRecordSchema: AnySchema = {
  allOf: [
    {
      "$ref": "#/definitions/HistoryRecord"
    }
  ],
  definitions: {
    HistoryRecord: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        date: {
          type: 'string',
          format: 'date-time'
        },
        result: {
          type: 'string',
          enum: Object.values(DidResolutionResult)
        },
        report: {
          type: 'string'
        }
      },
      required: [
        'name',
        'date',
        'result',
        'report'
      ]
    },
    DidResponse: resolutionResponseSchema.definitions.DidResponse
  }
}

const validateRecordWithSchema = (record: ResolverHistoryRecordRaw): string | null =>
  object.validateWithSchemaOrRef(
    historyRecordSchema,
    '',
    record
  );

// Getting of record from a set
const getRecordById = (records: GenericStateRecord[], id: string): GenericStateRecord | undefined =>
  records.find(r => r.id === id);

// useDidResolverHistory react hook
export const useDidResolverHistory = (): UseDidResolverHistoryHook => {
  const { resolverHistory } = useAppState();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(false);
  }, [resolverHistory]);

  const add = useCallback((record: ResolverHistoryRecordRaw): string | undefined => {
    try {
      setLoading(true);
      const validationResult = validateRecordWithSchema(record);

      if (validationResult !== null) {
        throw new Error(
          `Resolution result record validation error: ${validationResult}`
        );
      }

      const id = uid.simpleUid(8);
      dispatch({
        type: 'SET_RECORD',
        payload: {
          name: 'resolverHistory',
          record: {
            id,
            ...record
          }
        }
      });

      logger.debug('Added record', {
        id,
        ...record
      });
      return id;
    } catch (error) {
      logger.error(error);
      setError((error as Error).message || 'Unknown useDidResolverHistory error');
      setLoading(false);
    }
  }, [dispatch]);

  const remove = useCallback((id: string): string | undefined => {
    try {
      setLoading(true);
      const targetRecord = getRecordById(resolverHistory, id);

      if (!targetRecord) {
        throw new Error(`Resolution record with id: ${id} does not exists`);
      }

      dispatch({
        type: 'REMOVE_RECORD',
        payload: {
          name: 'resolverHistory',
          id
        }
      });
      return id;
    } catch (error) {
      logger.error(error);
      setError((error as Error).message || 'Unknown useDidResolverHistory error');
      setLoading(false);
    }
  }, [dispatch, resolverHistory]);

  return [add, remove, loading, error];
};
