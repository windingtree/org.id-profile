import type { AnySchema } from '@windingtree/org.id-utils/dist/object';
import { useState, FC, useEffect, useCallback, useContext } from 'react';
import { Box, Button, Form, FormField, TextInput, Text, ResponsiveContext } from 'grommet';
import { MessageBox } from './MessageBox';
import { useKeysManager, allowedKeysTypes, revocationReasonValues } from '../hooks/useKeysManager';
import { useAppState } from '../store';
import { KeyRecordRaw } from '../store/actions';
import { Modal } from './Modal';
import { object } from '@windingtree/org.id-utils';
import { useRequestPermissions } from '../hooks/useRequestPermissions';

export const keyRecordRawSchema: AnySchema = {
  type: 'object',
  properties: {
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
  required: ['type', 'publicKey', 'tag']
}

const validateKeyRecordRawWithSchema = (record: KeyRecordRaw): string | null =>
  object.validateWithSchemaOrRef(
    keyRecordRawSchema,
    '',
    record
  );

const defaultRecord:KeyRecordRaw = {
  tag: '',
  publicKey:'',
  note:'',
  type: allowedKeysTypes[0]
}

export const KeyFormModal:FC<{show: boolean;close():void}> = ({show, close, children}) => {
  const size = useContext(ResponsiveContext);
  const { account, keys, provider } = useAppState();
  const [addKey,,,,,keyError] = useKeysManager();
  const [rawRecord, setRawRecord] = useState(defaultRecord);
  const [requestPermissions] = useRequestPermissions(provider);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setError(keyError);
  }, [keyError]);

  useEffect(() => {
    setProcessing(false);
  }, [keyError, error]);

  const onSubmit = useCallback(async (value:KeyRecordRaw) => {
    setProcessing(true)
    try {
      value = {
        ...value,
        publicKey: account
      };
      const validationResult = validateKeyRecordRawWithSchema(value);
      if (validationResult !== null) {
        throw new Error(`Validation error: ${validationResult}`);
      }

      const id = await addKey(value)
      if (id !== undefined) {
        close()
        setRawRecord({...defaultRecord})
      }

    } catch(error) {
      setProcessing(false);
      setError((error as Error).message || 'Unknown error');
    }

  },[account, setError, addKey, setProcessing, close]);

  return (
    <Modal show={show} onClose={close}>
      <Box pad='large' >
        <Form
          value={rawRecord}
          validate='blur'
          onChange={nextValue => setRawRecord(nextValue)}
          onReset={() => {
            setError(undefined);
            setRawRecord({...defaultRecord})
            close()
          }}
          onSubmit={({ value }) => onSubmit(value)}
        >
          <Box border='bottom' direction='row' pad='small' justify='between' height='xsmall'>
            <Box direction='column' justify='between' >
              <Text>Account</Text>
              <Text weight='bold'>{account}</Text>
            </Box>
            <Box justify='center'>
              <Button onClick={() => requestPermissions('eth_accounts',{})} primary label="Change" />
            </Box>
          </Box>
          <FormField
            name="tag"
            htmlFor="text-input-id-tag"
            label="Key Tag"
            validate={[
              {
                regexp: /^[A-Za-z0-9-()_]+$/,
                message: 'Invalid Key tag format'
              },
              ((...args: any[]) =>  {
                const tagExsit = keys.find((key) => key.tag === args[0])
                if (tagExsit !== undefined) {
                  return {
                    message: `Key tag '${tagExsit.tag}' already exists`,
                    status: 'error'
                  }
                }
              })
            ]}
          >
            <TextInput id="text-input-id-tag" name="tag" />
          </FormField>
          <FormField
            name="note"
            htmlFor="text-input-id-note"
            label="Key Note"
          >
            <TextInput id="text-input-id-note" name="note" />
          </FormField>
          <Box direction="row" gap="medium">
            <Button size='large' disabled={processing} type="submit" primary label="Add" />
            <Button size='large' disabled={processing} type='reset' label="Cancel" />
          </Box>
          <MessageBox show={error !== undefined} type='error'>
            <Text size={size}>{error}</Text>
          </MessageBox>
        </Form>
      </Box>
    </Modal>
  );
}
