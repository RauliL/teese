import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import React, { FunctionComponent, ReactNode, SyntheticEvent } from 'react';

export type ErrorMessageSnackbarProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
};

const ErrorMessageSnackbar: FunctionComponent<ErrorMessageSnackbarProps> = ({
  children,
  onClose,
  open,
}) => {
  const handleClose = (event: MouseEvent | SyntheticEvent, reason?: string) => {
    if (reason !== 'clickaway') {
      onClose();
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert severity="error">{children}</Alert>
    </Snackbar>
  );
};

export default ErrorMessageSnackbar;
