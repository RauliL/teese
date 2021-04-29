import { entries, orderBy } from 'lodash';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Item, ItemStatus } from '../types';

import { client } from './api';

type UseAllItemsState = {
  todo: [string, Item][];
  inProgress: [string, Item][];
  done: [string, Item][];
  error: boolean;
};

export const useAllItems = () => {
  const { data, error } = useSWR('items', () =>
    client.get<Record<string, Item>>('/').then((response) => response.data)
  );
  const [state, setState] = useState<UseAllItemsState>({
    todo: [],
    inProgress: [],
    done: [],
    error: false,
  });

  useEffect(() => {
    const dataEntries = data ? entries(data) : undefined;

    setState({
      todo: orderBy(
        dataEntries?.filter((entry) => entry[1].status === ItemStatus.TODO) ??
          [],
        'priority'
      ),
      inProgress: orderBy(
        dataEntries?.filter(
          (entry) => entry[1].status === ItemStatus.IN_PROGRESS
        ) ?? [],
        'priority'
      ),
      done: orderBy(
        dataEntries?.filter((entry) => entry[1].status === ItemStatus.DONE) ??
          [],
        'priority'
      ),
      error: error != null,
    });
  }, [data, error]);

  return state;
};

export const useItem = (id: string): [Item | undefined, boolean] => {
  const { data, error } = useSWR(`item:${id}`, () =>
    client.get<Item>(`/${id}`).then((response) => response.data)
  );

  return [data, error != null];
};
