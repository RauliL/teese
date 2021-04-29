import Link, { LinkProps, LinkTypeMap } from '@material-ui/core/Link';
import React, { FunctionComponent } from 'react';
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from 'react-router-dom';

export type RoutedLinkProps = LinkProps<
  LinkTypeMap['defaultComponent'],
  ReactRouterLinkProps
>;

const RoutedLink: FunctionComponent<RoutedLinkProps> = (props) => (
  <Link component={ReactRouterLink} {...props} />
);

export default RoutedLink;
