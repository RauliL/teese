import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { compact } from 'lodash';
import React, { DragEvent, FunctionComponent, MouseEvent } from 'react';
import { useHistory } from 'react-router';

import { Item, ItemPriority } from '../../../types';

import { RoutedLink } from '../navigation';

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: 'pointer',
    marginBottom: theme.spacing(1),
    overflow: 'hidden',
    padding: theme.spacing(2),
    textOverflow: 'ellipsis',
  },
  highPriorityItem: {
    backgroundColor: theme.palette.warning.light,
  },
}));

export type ItemListItemProps = {
  id: string;
  item: Item;
};

const ItemListItem: FunctionComponent<ItemListItemProps> = ({ id, item }) => {
  const classes = useStyles();
  const history = useHistory();

  const handleClick = (ev: MouseEvent) => {
    ev.preventDefault();
    history.push(`/show/${id}`);
  };

  const handleDragStart = (ev: DragEvent) => {
    ev.dataTransfer.setData('id', id);
  };

  return (
    <Paper
      className={compact([
        classes.root,
        item.priority === ItemPriority.HIGH
          ? classes.highPriorityItem
          : undefined,
      ]).join(' ')}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <RoutedLink to={`/show/${id}`} underline="none">
        {item.title}
      </RoutedLink>
    </Paper>
  );
};

export default ItemListItem;
