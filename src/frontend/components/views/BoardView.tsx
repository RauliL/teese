import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React, { DragEvent, FunctionComponent, useState } from 'react';

import { Item, ItemStatus } from '../../../types';

import { patchItem } from '../../api';
import { useAllItems } from '../../hooks';

import { ItemList } from '../board';
import { ErrorMessage, ErrorMessageSnackbar } from '../feedback';

const useStyles = makeStyles((theme) => ({
  column: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
}));

const BoardView: FunctionComponent = () => {
  const classes = useStyles();
  const { done, error, inProgress, todo } = useAllItems();
  const [
    showErrorMessageSnackbar,
    setShowErrorMessageSnackbar,
  ] = useState<boolean>(false);

  const handleDrop = (status: ItemStatus) => (ev: DragEvent) => {
    const id = ev.dataTransfer.getData('id');
    let item: Item | undefined;

    ev.preventDefault();

    if (!id) {
      return;
    }

    item = [...todo, ...inProgress, ...done].find(
      (mapping) => mapping[0] === id
    )?.[1];

    if (!item) {
      return;
    }

    if (item.status === status) {
      return;
    }

    return patchItem(id, { status }).catch(() =>
      setShowErrorMessageSnackbar(true)
    );
  };

  const handleDragOver = (ev: DragEvent) => {
    ev.preventDefault();
  };

  const handleErrorMessageSnackbarClose = () =>
    setShowErrorMessageSnackbar(false);

  if (error) {
    return <ErrorMessage>Unable to retrieve items from the API.</ErrorMessage>;
  }

  return (
    <>
      <Grid container alignItems="stretch">
        <Grid
          item
          xs={4}
          className={classes.column}
          onDrop={handleDrop(ItemStatus.TODO)}
          onDragOver={handleDragOver}
        >
          <ItemList items={todo} status={ItemStatus.TODO} />
        </Grid>
        <Grid
          item
          xs={4}
          className={classes.column}
          onDrop={handleDrop(ItemStatus.IN_PROGRESS)}
          onDragOver={handleDragOver}
        >
          <ItemList items={inProgress} status={ItemStatus.IN_PROGRESS} />
        </Grid>
        <Grid
          item
          xs={4}
          className={classes.column}
          onDrop={handleDrop(ItemStatus.DONE)}
          onDragOver={handleDragOver}
        >
          <ItemList items={done} status={ItemStatus.DONE} />
        </Grid>
      </Grid>
      <ErrorMessageSnackbar
        onClose={handleErrorMessageSnackbarClose}
        open={showErrorMessageSnackbar}
      >
        Unable to perform operation.
      </ErrorMessageSnackbar>
    </>
  );
};

export default BoardView;
