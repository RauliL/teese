import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React, { FunctionComponent } from 'react';

import ToolbarLink from './ToolbarLink';

export type GoBackLinkProps = {
  to: string;
};

const GoBackLink: FunctionComponent<GoBackLinkProps> = ({ to }) => (
  <ToolbarLink aria-label="Go back" to={to}>
    <ArrowBackIcon />
  </ToolbarLink>
);

export default GoBackLink;
