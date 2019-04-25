import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid2Columns from '../grids/Grid2Columns';
import Grid1ColumnVerticalRows from '../grids/Grid1ColumnVerticalRows';
import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../commons/constants';
import { cutFilePath, cutText } from '../commons/utils';

export const MyCheckbox = withStyles(theme => ({
  root: {
    padding: '0 12px'
  }
}))(Checkbox);

export const MyRadio = withStyles(theme => ({
  root: {
    padding: '0 12px'
  }
}))(Radio);

export const MyFormControlLabel = withStyles(theme => ({
  root: {
    alignItems: 'flex-start'
  }
}))(FormControlLabel);

const styles = theme => ({
  pathHeader: {
    fontWeight: 'bold',
  },
  fileNamePane: {
    display: 'flex',
    alignItems: 'center',
  },
  fileNameExtension: {
    marginLeft: '8px',
  },
  variantsPane: {
    marginTop: '16px',
  },
});

class FunctionsScaffoldDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    dirPath: PropTypes.string,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    onOpenMarket: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    dirPath: '',
    onClose: () => {
      console.info('FunctionsScaffoldDialog.onClose is not set');
    },
    onSubmit: (options) => {
      console.info('FunctionsScaffoldDialog.onSubmit is not set: ', options);
    },
    onOpenMarket: (options) => {
      console.info('FunctionsScaffoldDialog.onOpenMarket is not set: ', options);
    },
  };

  constructor (props) {
    super(props);
    const { dirPath } = this.props;
    this.state = {
      fileExtension: constants.JS_FILE_EXTENSION,
      nameText: '',
      nameError: false,
      directoryNameText: dirPath,
      directoryNameError: false,
      functionsVariants: {
        'setValue': true, 'getValue': true, 'setAndGetValue': true
      },
      valueType: 'object'
    };
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { isOpen, dirPath } = this.props;
    const {
      nameText,
      nameError,
      directoryNameText,
      directoryNameError,
      fileExtension,
      functionsVariants,
      valueType
    } = this.state;
    return isOpen !== nextProps.isOpen
      || dirPath !== nextProps.dirPath
      || nameText !== nextState.nameText
      || nameError !== nextState.nameError
      || directoryNameText !== nextState.directoryNameText
      || directoryNameError !== nextState.directoryNameError
      || fileExtension !== nextState.fileExtension
      || functionsVariants !== nextState.functionsVariants
      || valueType !== nextState.valueType;
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { dirPath, isOpen } = this.props;
    if (dirPath !== prevProps.dirPath || isOpen !== prevProps.isOpen) {
      this.setState({
        directoryNameText: dirPath,
      });
    }
  }

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClose(false);
  };

  handleSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { nameText, directoryNameText, fileExtension, functionsVariants, valueType } = this.state;
    const { nameError, directoryNameError } = this.validateTexts({
      directoryNameText,
      nameText
    });
    if (!nameError && !directoryNameError) {
      const { onSubmit } = this.props;
      onSubmit({
        name: nameText,
        directoryName: directoryNameText,
        fileExtension,
        functionsVariants,
        valueType
      });
    } else {
      this.setState({
        nameError,
        directoryNameError
      });
    }
  };

  handleOpenMarket = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onOpenMarket();
  };

  validateTexts = ({ nameText, directoryNameText }) => {
    const nameMatches = constants.COMPONENT_NAME_VALID_REGEXP.exec(nameText);
    const directoryNameMatches = constants.FILE_PATH_VALID_REGEXP.exec(directoryNameText);
    return {
      nameError: !nameText || !nameMatches,
      directoryNameError: !!(directoryNameText && !directoryNameMatches),
    };
  };

  handleNameChange = (e) => {
    const nameText = e.target.value;
    const newState = {
      nameText,
      ...this.validateTexts({ nameText, directoryNameText: this.state.directoryNameText })
    };
    this.setState(newState);
  };

  handleDirectoryNameChange = (e) => {
    const directoryNameText = e.target.value;
    const newState = {
      directoryNameText,
      ...this.validateTexts({ nameText: this.state.nameText, directoryNameText })
    };
    this.setState(newState);
  };

  handleToggleFileExtension = (e) => {
    this.setState({
      fileExtension: this.state.fileExtension === constants.JS_FILE_EXTENSION
        ? constants.TS_FILE_EXTENSION
        : constants.JS_FILE_EXTENSION
    });
  };

  handleChangeFunctionsVariants = (variant) => (e) => {
    const newFunctionsVariants = { ...this.state.functionsVariants };
    newFunctionsVariants[variant] = !newFunctionsVariants[variant];
    this.setState({
      functionsVariants: newFunctionsVariants
    });
  };

  handleToggleValueType = (e) => {
    this.setState({
      valueType: this.state.valueType === 'object' ? 'string' : 'object'
    });
  };

  render () {
    const { classes, isOpen } = this.props;
    if (!isOpen) {
      return null;
    }
    const {
      nameText,
      nameError,
      directoryNameText,
      directoryNameError,
      fileExtension,
      functionsVariants,
      valueType
    } = this.state;
    return (
      <Dialog
        aria-labelledby="ComponentScaffoldDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="sm"
        scroll="body"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogTitle
            id="ComponentScaffoldDialog-dialog-title"
            disableTypography={true}
          >
            Functions List Scaffold
          </DialogTitle>
          <DialogContent>
            {nameText && nameText.length > 0
              ? (
                <pre>
                  <span className={classes.pathHeader}>Path:&nbsp;</span>
                  {directoryNameText && directoryNameText.length > 0
                    ? (
                      <span>{cutText(cutFilePath(`src/usr/${directoryNameText}/${nameText}${fileExtension}`, 50, 3), 60)}</span>
                    )
                    : (
                      <span>{cutText(`src/usr/${nameText}${fileExtension}`, 60)}</span>
                    )
                  }
                </pre>
              )
              : (
                <pre>
                  <span>File path is empty</span>
                </pre>
              )
            }
            <div className={classes.fileNamePane}>
              <TextField
                autoFocus={true}
                margin="dense"
                id="functionsListName"
                label="Functions List Name"
                type="text"
                fullWidth={true}
                required={true}
                value={nameText}
                error={nameError}
                onChange={this.handleNameChange}
                InputProps={{
                  startAdornment:
                    <InputAdornment position="start">
                      <ResourceIcon resourceType={constants.GRAPH_MODEL_USER_FUNCTION_TYPE}/>
                    </InputAdornment>,
                }}
                helperText="Enter the name of the new functions list. Use alphanumeric characters."
              />
              <div className={classes.fileNameExtension}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={fileExtension === constants.TS_FILE_EXTENSION}
                      onChange={this.handleToggleFileExtension}
                      color="default"
                    />
                  }
                  label="TypeScript"
                />
              </div>
            </div>
            <TextField
              margin="dense"
              id="directory"
              label="Directory (optional)"
              type="text"
              fullWidth={true}
              required={false}
              value={directoryNameText}
              error={directoryNameError}
              onChange={this.handleDirectoryNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_DIR_TYPE} isMuted={true}/>
                  </InputAdornment>,
              }}
              helperText="Enter the directory path. Use '/' as a separator of the nested directories."
            />
            <div className={classes.variantsPane}>
                <Grid1ColumnVerticalRows>
                  <FormControlLabel
                    control={
                      <MyCheckbox
                        checked={functionsVariants['setValue']}
                        onChange={this.handleChangeFunctionsVariants('setValue')}
                        color="default"
                      />
                    }
                    label="Add function that sets a value into the local state"
                  />
                  <FormControlLabel
                    control={
                      <MyCheckbox
                        checked={functionsVariants['getValue']}
                        onChange={this.handleChangeFunctionsVariants('getValue')}
                        color="default"
                      />
                    }
                    label="Add function that gets a value from the local state"
                  />
                  <FormControlLabel
                    control={
                      <MyCheckbox
                        checked={functionsVariants['setAndGetValue']}
                        onChange={this.handleChangeFunctionsVariants('setAndGetValue')}
                        color="default"
                      />
                    }
                    label="Add function that gets and sets a value in the local state"
                  />
                  <Divider />
                  <Grid2Columns>
                    <FormControlLabel
                      control={
                        <MyRadio
                          checked={valueType === 'object'}
                          onChange={this.handleToggleValueType}
                          color="default"
                        />
                      }
                      label="Value type: object"
                    />
                    <FormControlLabel
                      control={
                        <MyRadio
                          checked={valueType === 'string'}
                          onChange={this.handleToggleValueType}
                          color="default"
                        />
                      }
                      label="Value type: string"
                    />
                  </Grid2Columns>
                </Grid1ColumnVerticalRows>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.handleSubmit} color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default withStyles(styles)(FunctionsScaffoldDialog);
