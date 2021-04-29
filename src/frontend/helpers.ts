import { ItemPriority, ItemStatus } from '../types';

export const renderItemStatus = (status: ItemStatus): string =>
  status === ItemStatus.TODO
    ? 'TODO'
    : status === ItemStatus.IN_PROGRESS
    ? 'In progress'
    : 'Done';

export const renderItemPriority = (priority: ItemPriority): string =>
  priority === ItemPriority.LOW
    ? 'Low'
    : priority === ItemPriority.NORMAL
    ? 'Normal'
    : 'High';
