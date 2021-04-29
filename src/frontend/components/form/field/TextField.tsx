import FormControl from '@material-ui/core/FormControl';
import TextFieldBase, {
  TextFieldProps as TextFieldBaseProps,
} from '@material-ui/core/TextField';
import { FieldAttributes, useField } from 'formik';
import React, { FunctionComponent } from 'react';

import { useErrorMessage, useStyles } from './hooks';

export type TextFieldProps = FieldAttributes<TextFieldBaseProps>;

const TextField: FunctionComponent<TextFieldProps> = (props) => {
  const classes = useStyles();
  const [field, meta] = useField(props);
  const [showError, errorMessage] = useErrorMessage(meta);

  return (
    <FormControl fullWidth className={classes.formControl}>
      <TextFieldBase
        {...field}
        variant="outlined"
        size="small"
        {...props}
        error={showError}
        helperText={errorMessage}
      />
    </FormControl>
  );
};

export default TextField;
