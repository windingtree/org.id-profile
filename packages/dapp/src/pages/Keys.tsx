import { PageWrapper } from '../pages/PageWrapper';
import { Box, Button } from 'grommet';
import { KeyFormModal } from '../components/KeyFormModal';
import { KeysList } from '../components/KeysList';
import { useState } from 'react';

export const Keys = () => {
  const [show, setShow] = useState(false);

  return (
    <PageWrapper>
      <KeyFormModal show={show} close={() => setShow(false)} />
      <Box pad='medium'>
        <Button size='large' primary label='Add Key' onClick={() => { setShow(true); }} />
      </Box>
      <KeysList />
    </PageWrapper>
  );
};
