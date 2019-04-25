import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { cutText } from './utils';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Cached from '@material-ui/icons/Cached';
import BugReport from '@material-ui/icons/BugReport';
import Refresh from '@material-ui/icons/Refresh';
import Layers from '@material-ui/icons/Layers';
import FormatAlignRight from '@material-ui/icons/FormatAlignRight';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import SlowMotionVideo from '@material-ui/icons/SlowMotionVideo';
import Save from '@material-ui/icons/Save';
import Toc from '@material-ui/icons/Toc';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import Stop from '@material-ui/icons/Stop';
import Close from '@material-ui/icons/Close';
import DesktopMac from '@material-ui/icons/DesktopMac';
import TabletMac from '@material-ui/icons/TabletMac';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import SettingsOverscan from '@material-ui/icons/SettingsOverscan';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Add from '@material-ui/icons/Add';
import FileCopy from '@material-ui/icons/FileCopy';
import Search from '@material-ui/icons/Search';
import Undo from '@material-ui/icons/Undo';
import Dvr from '@material-ui/icons/Dvr';
import OpenInBrowser from '@material-ui/icons/OpenInBrowser';
import NotificationImportant from '@material-ui/icons/NotificationImportant';
import NoteAdd from '@material-ui/icons/NoteAdd';
import Unarchive from '@material-ui/icons/Unarchive';
import CloudDownload from '@material-ui/icons/CloudDownload';
import CloudUpload from '@material-ui/icons/CloudUpload';
import CloudCircle from '@material-ui/icons/CloudCircle';
import CropOriginal from '@material-ui/icons/CropOriginal';
import Category from '@material-ui/icons/Category';
import Dashboard from '@material-ui/icons/Dashboard';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { CommonToolbarButton, CommonToolbarIconButton, CommonErrorBadge } from './Commons.parts';

const ToolbarButtonMenuItem = withStyles(theme => ({
  root: {
    fontSize: '14px',
    height: 'auto',
    paddingTop: 0,
    paddingBottom: 0,
  }
}))(MenuItem);

const styles = theme => ({
  buttonIcon: {
    fontSize: '16px',
  },
  buttonText: { marginLeft: '3px', whiteSpace: 'nowrap' }
});

const icons = {
  LibraryBooks,
  Cached,
  Refresh,
  BugReport,
  Layers,
  FormatAlignRight,
  Edit,
  Delete,
  DeleteOutline,
  SlowMotionVideo,
  Save,
  Toc,
  FiberManualRecord,
  Stop,
  Close,
  SettingsOverscan,
  DesktopMac,
  TabletMac,
  PhoneIphone,
  ArrowBack,
  ArrowForward,
  Add,
  FileCopy,
  Search,
  Undo,
  Dvr,
  OpenInBrowser,
  NotificationImportant,
  NoteAdd,
  Unarchive,
  CloudDownload,
  CloudUpload,
  CloudCircle,
  CropOriginal,
  Category,
  Dashboard,
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  OpenInNew,
};

class ToolbarButton extends React.Component {
  static propTypes = {
    iconType: PropTypes.string,
    iconColor: PropTypes.string,
    title: PropTypes.string,
    switchedOn: PropTypes.bool,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    disabled: PropTypes.bool,
    tooltip: PropTypes.string,
    titleLengthLimit: PropTypes.number,
    error: PropTypes.bool,
    menuItems: PropTypes.array,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    iconType: '',
    iconColor: undefined,
    title: '',
    switchedOn: false,
    primary: false,
    secondary: false,
    disabled: false,
    tooltip: '',
    titleLengthLimit: 25,
    error: false,
    menuItems: [],
    onClick: () => {
      console.info('ToolbarButton.onClick is not set');
    },
  };

  constructor (props, context) {
    super(props, context);
    this.state = {
      anchorEl: null,
    }
  }

  handleMenuClick = e => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleMenuItemClick = func => e => {
    if (func) {
      func();
    }
    this.handleMenuClose();
  };

  render () {
    const {
      iconType,
      iconColor,
      switchedOn,
      primary,
      secondary,
      disabled,
      title,
      tooltip,
      classes,
      titleLengthLimit,
      error,
      menuItems,
      onClick
    } = this.props;
    let icon = icons[iconType] || null;
    let variant = 'text';
    let color = 'default';
    const iconProps = {
      className: classes.buttonIcon,
    };
    if (!disabled) {
      if (switchedOn) {
        variant = 'outlined';
        color = 'primary';
      } else if (primary) {
        color = 'primary';
      } else if (secondary) {
        color = 'secondary';
      }
      if (iconColor) {
        iconProps.style = {
          color: iconColor,
        };
      } else {
        iconProps.style = {
          color: color,
        };
      }
    }
    if (icon) {
      icon = React.createElement(icon, iconProps);
    }
    if (title) {
      const textElement = (
        <span className={classes.buttonText}>
          {error
            ? (
              <CommonErrorBadge badgeContent={' '} color="secondary">
                <span>{cutText(title, titleLengthLimit)}</span>
              </CommonErrorBadge>
            )
            : (
              <span>{cutText(title, titleLengthLimit)}</span>
            )
          }
        </span>
      );
      if (menuItems.length > 0) {
        const menuItemsElements = [];
        menuItems.forEach(menuItem => {
          menuItemsElements.push(
            <ToolbarButtonMenuItem
              key={menuItem.label}
              onClick={this.handleMenuItemClick(menuItem.onClick)}
            >
              {menuItem.label}
            </ToolbarButtonMenuItem>
          );
        });
        const {anchorEl} = this.state;
        return (
          <div>
          <CommonToolbarButton
            size="small"
            color={color}
            variant={variant}
            disabled={disabled}
            title={tooltip}
            aria-owns={anchorEl ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={this.handleMenuClick}
          >
            {icon}
            {textElement}
          </CommonToolbarButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleMenuClose}
            >
              {menuItemsElements}
            </Menu>
          </div>
        );
      }
      return (
        <CommonToolbarButton
          size="small"
          color={color}
          variant={variant}
          onClick={onClick}
          disabled={disabled}
          title={tooltip}
        >
          {icon}
          {textElement}
        </CommonToolbarButton>
      );
    }
    return (
      <CommonToolbarIconButton
        size="small"
        color={color}
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
      >
        {icon}
      </CommonToolbarIconButton>
    );
  }
}

export default withStyles(styles)(ToolbarButton);
