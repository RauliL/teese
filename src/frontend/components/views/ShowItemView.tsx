import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import React, { FunctionComponent } from 'react';
import MarkdownView from 'react-showdown';

import { renderItemPriority, renderItemStatus } from '../../helpers';

import { PageTitle } from '../layout';

import { InjectedItemProps, withItem } from './decorators';

const ShowItemView: FunctionComponent<InjectedItemProps> = ({ item }) => (
  <>
    <PageTitle>{item.title}</PageTitle>
    <Grid item container direction="row-reverse" alignItems="stretch">
      <Grid item md={2} xs={12}>
        <Paper>
          <List>
            <ListItem>
              <ListItemText
                primary="Created"
                secondary={new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(new Date(item.createdOn))}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Status"
                secondary={renderItemStatus(item.status)}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Priority"
                secondary={renderItemPriority(item.priority)}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
      <Grid item md={10} xs={12}>
        <MarkdownView markdown={item.text} />
      </Grid>
    </Grid>
  </>
);

export default withItem(ShowItemView);
