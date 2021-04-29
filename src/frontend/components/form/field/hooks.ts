import { makeStyles } from '@material-ui/core/styles';
import { FieldMetaProps } from 'formik';

export const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  preview: {
    minHeight: 95 + theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

export const useErrorMessage = <T extends {}>(
  meta: FieldMetaProps<T>
): [boolean, string | undefined] => {
  const showError = meta.touched && meta.error;

  return showError ? [true, meta.error] : [false, undefined];
};
