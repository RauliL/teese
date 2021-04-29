import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    backdrop: {
      color: theme.palette.common.white,
      zIndex: theme.zIndex.drawer + 1,
    },
  })
);

const LoadingIndicator: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Backdrop className={classes.backdrop} open>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default LoadingIndicator;
