import React, { ComponentType, FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Item } from '../../../types';

import { useItem } from '../../hooks';

import { ErrorMessage, LoadingIndicator } from '../feedback';

export type InjectedItemProps = {
  id: string;
  item: Item;
};

type WrapperComponentProps = RouteComponentProps<{ id: string }>;

export const withItem = (
  WrappedComponent: ComponentType<InjectedItemProps>
) => {
  const wrapper: FunctionComponent<WrapperComponentProps> = ({
    match: {
      params: { id },
    },
  }) => {
    const [item, error] = useItem(id);

    return error ? (
      <ErrorMessage>Unable to retrieve item from the API.</ErrorMessage>
    ) : item ? (
      <WrappedComponent id={id} item={item} />
    ) : (
      <LoadingIndicator />
    );
  };

  return withRouter(wrapper);
};
