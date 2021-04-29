import { values } from 'lodash';
import * as yup from 'yup';

import { ItemPriority, ItemStatus } from '../types';

export const ITEM_SCHEMA = yup.object().shape({
  createdOn: yup.date().default(() => new Date()),
  title: yup.string().max(150),
  text: yup.string(),
  status: yup.number().oneOf(values(ItemStatus) as number[]),
  priority: yup.number().oneOf(values(ItemPriority) as number[]),
});
