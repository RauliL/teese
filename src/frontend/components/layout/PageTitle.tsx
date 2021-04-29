import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent, ReactNode } from 'react';

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

export type PageTitleProps = {
  children: ReactNode;
};

const PageTitle: FunctionComponent<PageTitleProps> = ({ children }) => (
  <Typography component="h2" variant="h4">
    {children}
  </Typography>
);

export default PageTitle;
