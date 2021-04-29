export enum ItemStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

export enum ItemPriority {
  HIGH = 1,
  NORMAL = 0,
  LOW = -1,
}

export type Item = {
  createdOn: string;
  title: string;
  text: string;
  status: ItemStatus;
  priority: ItemPriority;
};
