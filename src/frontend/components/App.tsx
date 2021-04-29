import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import theme from '../theme';

import { Toolbar } from './toolbar';
import {
  BoardView,
  CreateItemView,
  EditItemView,
  NotFoundView,
  ShowItemView,
} from './views';

const App: FunctionComponent = () => (
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <CssBaseline />
      <Toolbar />
      <Container>
        <Switch>
          <Route path="/" exact component={BoardView} />
          <Route path="/create" exact component={CreateItemView} />
          <Route path="/edit/:id" exact component={EditItemView} />
          <Route path="/show/:id" exact component={ShowItemView} />
          <Route path="*" component={NotFoundView} />
        </Switch>
      </Container>
    </BrowserRouter>
  </MuiThemeProvider>
);

export default App;
