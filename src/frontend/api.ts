import axios from 'axios';
import { mutate } from 'swr';

import { Item } from '../types';

export const client = axios.create({ baseURL: '/api' });

export const createItem = (data: Partial<Item>): Promise<Item> =>
  client.post<Item>('/', data).then(async (response) => {
    await mutate('items');

    return response.data;
  });

export const patchItem = (id: string, data: Partial<Item>): Promise<Item> =>
  client.patch<Item>(`/${id}`, data).then(async (response) => {
    await mutate('items');
    await mutate(`item:${id}`, response.data);

    return response.data;
  });

export const deleteItem = (id: string): Promise<void> =>
  client.delete(`/${id}`).then(async () => {
    await mutate('items');
    await mutate(`item:${id}`, null);

    return Promise.resolve();
  });
