import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ErrorIcon from '@material-ui/icons/Error';
import React, { FunctionComponent, ReactNode } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    padding: theme.spacing(4),
  },
  icon: {
    textAlign: 'center',
  },
}));

export type ErrorMessageProps = {
  children: ReactNode;
};

const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({ children }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Grid container justify="center" alignItems="center">
        <Grid md={2} xs={4} className={classes.icon}>
          <ErrorIcon fontSize="large" />
        </Grid>
        <Grid md={10} xs={8}>
          <Typography>{children}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ErrorMessage;
