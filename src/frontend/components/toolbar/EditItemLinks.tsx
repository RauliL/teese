import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { DeleteItemButton } from './button';
import { GoBackLink } from './link';

export type EditItemLinksProps = RouteComponentProps<{ id: string }>;

const EditItemLinks: FunctionComponent<EditItemLinksProps> = ({
  match: {
    params: { id },
  },
}) => (
  <>
    <GoBackLink to={`/show/${id}`} />
    <DeleteItemButton id={id} />
  </>
);

export default withRouter(EditItemLinks);
