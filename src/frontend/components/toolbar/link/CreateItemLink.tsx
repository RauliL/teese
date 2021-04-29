import AddIcon from '@material-ui/icons/Add';
import React, { FunctionComponent } from 'react';

import ToolbarLink from './ToolbarLink';

const CreateItemLink: FunctionComponent = () => (
  <ToolbarLink to="/create" aria-label="Create new item">
    <AddIcon />
  </ToolbarLink>
);

export default CreateItemLink;
