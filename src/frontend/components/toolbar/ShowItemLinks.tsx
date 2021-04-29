import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { DeleteItemButton } from './button';
import { EditItemLink, GoBackLink } from './link';

export type ShowItemLinksProps = RouteComponentProps<{ id: string }>;

const ShowItemLinks: FunctionComponent<ShowItemLinksProps> = ({
  match: {
    params: { id },
  },
}) => (
  <>
    <GoBackLink to="/" />
    <EditItemLink id={id} />
    <DeleteItemButton id={id} />
  </>
);

export default withRouter(ShowItemLinks);
