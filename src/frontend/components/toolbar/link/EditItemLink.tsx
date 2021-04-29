import EditIcon from '@material-ui/icons/Edit';
import React, { FunctionComponent } from 'react';

import ToolbarLink from './ToolbarLink';

export type EditItemLinkProps = {
  id: string;
};

const EditItemLink: FunctionComponent<EditItemLinkProps> = ({ id }) => (
  <ToolbarLink to={`/edit/${id}`} aria-label="Edit item">
    <EditIcon />
  </ToolbarLink>
);

export default EditItemLink;
