import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';

import { patchItem } from '../../api';

import { ItemForm, ItemFormValues } from '../form';
import { PageTitle } from '../layout';

import { InjectedItemProps, withItem } from './decorators';

const EditItemView: FunctionComponent<InjectedItemProps> = ({ id, item }) => {
  const history = useHistory();

  const handleSubmit = (values: ItemFormValues) =>
    patchItem(id, values).then(() => history.push('/'));

  return (
    <>
      <PageTitle>Edit item</PageTitle>
      <ItemForm initialValues={item} onSubmit={handleSubmit} />
    </>
  );
};

export default withItem(EditItemView);
