import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select, { SelectProps } from '@material-ui/core/Select';
import { FieldAttributes, useField } from 'formik';
import React, { FunctionComponent } from 'react';

import { useErrorMessage, useStyles } from './hooks';

export type EnumSelectFieldProps = FieldAttributes<SelectProps> & {
  label: string;
  renderValueLabel: (value: number) => string;
  values: number[];
};

const EnumSelectField: FunctionComponent<EnumSelectFieldProps> = ({
  label,
  renderValueLabel,
  values,
  ...props
}) => {
  const classes = useStyles();
  const [field, meta] = useField(props);
  const [showError, errorMessage] = useErrorMessage(meta);

  return (
    <FormControl
      className={classes.formControl}
      fullWidth
      variant="outlined"
      size="small"
    >
      <InputLabel id={props.id}>{label}</InputLabel>
      <Select label={label} labelId={props.id} {...field} {...props}>
        {values.map((value) => (
          <MenuItem key={value} value={value}>
            {renderValueLabel(value)}
          </MenuItem>
        ))}
      </Select>
      {showError && (
        <FormHelperText error={showError}>{errorMessage}</FormHelperText>
      )}
    </FormControl>
  );
};

export default EnumSelectField;
