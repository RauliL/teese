import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';

import { Item, ItemStatus } from '../../../types';

import { renderItemStatus } from '../../helpers';

import ItemListItem from './ItemListItem';

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}));

export type ItemListProps = {
  items: [string, Item][];
  status: ItemStatus;
};

const ItemList: FunctionComponent<ItemListProps> = ({ items, status }) => {
  const classes = useStyles();

  return (
    <>
      <Typography component="h2" align="center" className={classes.title}>
        {renderItemStatus(status)}
      </Typography>
      {items.map(([id, item]) => (
        <ItemListItem key={id} id={id} item={item} />
      ))}
    </>
  );
};

export default ItemList;
