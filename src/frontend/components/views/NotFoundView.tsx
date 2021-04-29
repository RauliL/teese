import React, { FunctionComponent } from 'react';

import { ErrorMessage } from '../feedback';

const NotFoundView: FunctionComponent = () => (
  <ErrorMessage>Page not found.</ErrorMessage>
);

export default NotFoundView;
