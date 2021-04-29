import AppBar from '@material-ui/core/AppBar';
import ToolbarBase from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';
import { Route, Switch } from 'react-router';

import { RoutedLink } from '../navigation';

import { CreateItemLink, GoBackLink } from './link';

import EditItemLinks from './EditItemLinks';
import ShowItemLinks from './ShowItemLinks';

const useStyles = makeStyles({
  grow: {
    flexGrow: 1,
  },
});

const Toolbar: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <ToolbarBase>
        <Typography variant="h6">
          <RoutedLink to="/" underline="none" color="inherit">
            Teese
          </RoutedLink>
        </Typography>
        <div className={classes.grow} />
        <Switch>
          <Route path="/" exact component={CreateItemLink} />
          <Route path="/create" exact component={() => <GoBackLink to="/" />} />
          <Route path="/edit/:id" exact component={EditItemLinks} />
          <Route path="/show/:id" exact component={ShowItemLinks} />
        </Switch>
      </ToolbarBase>
    </AppBar>
  );
};

export default Toolbar;
