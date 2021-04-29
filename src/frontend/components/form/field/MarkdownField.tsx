import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { FieldAttributes, useField } from 'formik';
import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import MarkdownView from 'react-showdown';

import { useErrorMessage, useStyles } from './hooks';

export type MarkdownFieldProps = FieldAttributes<TextFieldProps>;

const MarkdownField: FunctionComponent<MarkdownFieldProps> = ({
  label,
  ...props
}) => {
  const classes = useStyles();
  const [field, meta] = useField(props);
  const [showError, errorMessage] = useErrorMessage(meta);
  const [openTab, setOpenTab] = useState<'edit' | 'preview'>('edit');
  const theme = useTheme();
  const isMediumWidth = useMediaQuery(theme.breakpoints.up('md'));

  const handleTabChange = (
    ev: ChangeEvent<{}>,
    newOpenTab: 'edit' | 'preview'
  ) => setOpenTab(newOpenTab);

  return (
    <FormControl fullWidth className={classes.formControl}>
      {!isMediumWidth && (
        <Tabs value={openTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Edit" icon={<EditIcon />} value="edit" />
          <Tab label="Preview" icon={<VisibilityIcon />} value="preview" />
        </Tabs>
      )}
      <Grid container>
        <Grid item md={6} xs={12} hidden={!isMediumWidth && openTab !== 'edit'}>
          <TextField
            {...field}
            fullWidth
            multiline
            variant="outlined"
            size="small"
            rows={5}
            {...props}
            error={showError}
            helperText={errorMessage}
          />
        </Grid>
        <Grid
          item
          md={6}
          xs={12}
          hidden={!isMediumWidth && openTab !== 'preview'}
          className={classes.preview}
        >
          <MarkdownView markdown={(field.value as string) ?? ''} />
        </Grid>
      </Grid>
    </FormControl>
  );
};

export default MarkdownField;
