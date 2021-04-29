import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React, { FunctionComponent, useState } from 'react';
import { useHistory } from 'react-router';

import { deleteItem } from '../../../api';

export type DeleteItemButtonProps = {
  id: string;
};

const DeleteItemButton: FunctionComponent<DeleteItemButtonProps> = ({ id }) => {
  const history = useHistory();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState<boolean>(
    false
  );

  const handleClick = () => setConfirmationDialogOpen(true);

  const handleClose = () => setConfirmationDialogOpen(false);

  const handleConfirmButtonClick = () =>
    deleteItem(id)
      .then(() => history.push('/'))
      .finally(() => setConfirmationDialogOpen(false));

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleClose}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-text"
      >
        <DialogTitle id="confirmation-dialog-title">Delete item?</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-text">
            Do you really want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmButtonClick} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteItemButton;
