import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import { Form, Formik } from 'formik';
import React, { FunctionComponent } from 'react';

import { Item, ItemPriority, ItemStatus } from '../../../types';

import { renderItemPriority, renderItemStatus } from '../../helpers';

import { EnumSelectField, MarkdownField, TextField } from './field';

export type ItemFormValues = Omit<Item, 'createdOn'>;

export type ItemFormProps = {
  initialValues: ItemFormValues;
  onSubmit: (values: ItemFormValues) => void;
};

const ItemForm: FunctionComponent<ItemFormProps> = ({
  initialValues,
  onSubmit,
}) => (
  <Formik initialValues={initialValues} onSubmit={onSubmit}>
    <Form>
      <TextField
        id="title"
        name="title"
        type="text"
        label="Title"
        required
        maxLength={150}
      />
      <EnumSelectField
        id="status"
        name="status"
        label="Status"
        required
        renderValueLabel={renderItemStatus}
        values={[ItemStatus.DONE, ItemStatus.IN_PROGRESS, ItemStatus.TODO]}
      />
      <EnumSelectField
        id="priority"
        name="priority"
        label="Priority"
        required
        renderValueLabel={renderItemPriority}
        values={[ItemPriority.HIGH, ItemPriority.NORMAL, ItemPriority.LOW]}
      />
      <MarkdownField id="text" name="text" label="Text" />
      <Button
        type="submit"
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        startIcon={<SaveIcon />}
      >
        Save
      </Button>
    </Form>
  </Formik>
);

export default ItemForm;
