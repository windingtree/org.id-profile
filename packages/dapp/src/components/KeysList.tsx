import { Box, Text, Grid, ResponsiveContext } from 'grommet';
import { useAppState } from "../store";
import { KeyRecord } from "../store/actions";
import { Trash, Edit } from 'grommet-icons';
import { useContext } from 'react';

export const KeysList = () => {
  const size = useContext(ResponsiveContext);
  const { account, keys } = useAppState();
  const status = (key:KeyRecord) => {
    if (key.revocation !== undefined) {
      return 'revoked'
    }
    if (key.publicKey === account ) {
      return 'connected'
    }
    return ''
  }

  return (
    <Box pad='medium'>
      <Grid
        pad='small'
        fill='horizontal'
        responsive
        border='bottom'
        columns={['flex', 'flex', '12rem', 'xsmall', 'xsmall']}
        align='center'
      >
        <Text size={size} weight='bold'>Key note</Text>
        <Text size={size} weight='bold'>Key tag</Text>
        <Text size={size} weight='bold'>status</Text>
        <Text size={size} weight='bold'>Edit</Text>
        <Text size={size} weight='bold'>Delete</Text>
      </Grid>
      {keys.map((key,i) =>
        <Grid
          key={i}
          pad='small'
          fill='horizontal'
          responsive
          border='bottom'
          columns={['flex', 'flex', '12rem', 'xsmall', 'xsmall']}
          align='center'
        >
          <Text size={size}>{key.note}</Text>
          <Text size={size}>{key.tag}</Text>
          <Text size={size}>{status(key)}</Text>
          <Edit onClick={() => {console.log('Edit')} } />
          <Trash onClick={() => {console.log('Delete')} }/>
        </Grid>
      )}
    </Box>
  );
};
