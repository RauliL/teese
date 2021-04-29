import React, { FunctionComponent } from 'react';
import { useHistory } from 'react-router';

import { ItemPriority, ItemStatus } from '../../../types';

import { createItem } from '../../api';

import { ItemForm, ItemFormValues } from '../form';
import { PageTitle } from '../layout';

const CreateItemView: FunctionComponent = () => {
  const history = useHistory();

  const handleSubmit = (values: ItemFormValues) =>
    createItem(values).then(() => history.push('/'));

  return (
    <>
      <PageTitle>Create new item</PageTitle>
      <ItemForm
        initialValues={{
          title: '',
          text: '',
          status: ItemStatus.TODO,
          priority: ItemPriority.NORMAL,
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default CreateItemView;
