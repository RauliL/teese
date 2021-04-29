import IconButton from '@material-ui/core/IconButton';
import React, { FunctionComponent, ReactNode, forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

const RoutedLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link ref={ref} {...props} />
));

export type ToolbarLinkProps = {
  'aria-label': string;
  children: ReactNode;
  to: string;
};

const ToolbarLink: FunctionComponent<ToolbarLinkProps> = ({
  children,
  to,
  ...props
}) => (
  <IconButton
    component={RoutedLink}
    to={to}
    color="inherit"
    aria-label={props['aria-label']}
  >
    {children}
  </IconButton>
);

export default ToolbarLink;
