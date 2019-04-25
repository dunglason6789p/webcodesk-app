import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../commons/constants';

class CopyPageDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    dirPath: PropTypes.string,
    pageResource: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    dirPath: '',
    pageResource: null,
    onClose: () => {
      console.info('CopyPageDialog.onClose is not set');
    },
    onSubmit: (options) => {
      console.info('CopyPageDialog.onSubmit is not set: ', options);
    },
  };

  constructor (props) {
    super(props);
    const {dirPath, pageResource} = this.props;
    this.state = {
      nameText: pageResource ? pageResource.displayName : '',
      nameError: false,
      directoryNameText: dirPath,
      directoryNameError: false,
    };
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const {isOpen, dirPath, pageResource} = this.props;
    const { nameText, nameError, directoryNameText, directoryNameError } = this.state;
    return isOpen !== nextProps.isOpen
      || dirPath !== nextProps.dirPath
      || pageResource !== nextProps.pageResource
      || nameText !== nextState.nameText
      || nameError !== nextState.nameError
      || directoryNameText !== nextState.directoryNameText
      || directoryNameError !== nextState.directoryNameError;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {dirPath, isOpen, pageResource} = this.props;
    if (dirPath !== prevProps.dirPath || isOpen !== prevProps.isOpen) {
      this.setState({
        directoryNameText: dirPath,
      });
    }
    if (pageResource && pageResource !== prevProps.pageResource) {
      this.setState({
        nameText: pageResource.displayName,
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
    const { nameText, directoryNameText } = this.state;
    const { nameError, directoryNameError } = this.validateTexts({
      directoryNameText,
      nameText
    });
    if (!nameError && !directoryNameError) {
      const { onSubmit, pageResource } = this.props;
      onSubmit({
        name: nameText,
        directoryName: directoryNameText,
        resource: pageResource
      });
    } else {
      this.setState({
        nameError,
        directoryNameError
      });
    }
  };

  validateTexts = ({nameText, directoryNameText}) => {
    const nameMatches = constants.FILE_NAME_VALID_REGEXP.exec(nameText);
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
      ...this.validateTexts({nameText, directoryNameText: this.state.directoryNameText})
    };
    this.setState(newState);
  };

  handleDirectoryNameChange = (e) => {
    const directoryNameText = e.target.value;
    const newState = {
      directoryNameText,
      ...this.validateTexts({nameText: this.state.nameText, directoryNameText})
    };
    this.setState(newState);
  };

  render () {
    const { isOpen, pageResource } = this.props;
    if (!isOpen) {
      return null;
    }
    const { nameText, nameError, directoryNameText, directoryNameError } = this.state;
    return (
      <Dialog
        aria-labelledby="CopyPageDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="sm"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogTitle
            id="CopyPageDialog-dialog-title"
            disableTypography={true}
          >
            {pageResource ? `Copy "${pageResource.displayName}" Page` : 'Copy Page'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus={true}
              margin="dense"
              id="pageName"
              label="Page Name"
              type="text"
              fullWidth={true}
              required={true}
              value={nameText}
              error={nameError}
              onChange={this.handleNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_PAGE_TYPE} />
                  </InputAdornment>,
              }}
              helperText="Enter the name of the new page. Use alphanumeric characters and '_' character."
            />
            <TextField
              margin="dense"
              id="directory"
              label="Path (optional)"
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
              helperText="Enter the path. Use '/' as a separator of the nested directories."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" onClick={this.handleSubmit} color="primary">
              Copy
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default CopyPageDialog;
