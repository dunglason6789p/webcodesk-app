import isEqual from 'lodash/isEqual';
import constants from '../../commons/constants';

class DeclarationsInFile {
  constructor (resourceType, declarations, filePath) {
    Object.defineProperties(this, {
      'resourceType': {
        value: resourceType,
        writable: false,
      },
      'declarations': {
        value: declarations,
        writable: false,
      },
      'filePath': {
        value: filePath,
        writable: false,
      },
      'hasDeclarations': {
        get: function () {
          return this.declarations && this.declarations.length > 0;
        }
      },
      'isInUserFunctions': {
        get: function() {
          return this.resourceType === constants.RESOURCE_IN_USER_FUNCTIONS_TYPE;
        }
      },
      'isInComponents': {
        get: function() {
          return this.resourceType === constants.RESOURCE_IN_COMPONENTS_TYPE;
        }
      },
      'isInComponentStories': {
        get: function() {
          return this.resourceType === constants.RESOURCE_IN_COMPONENT_STORIES_TYPE;
        }
      },
      'isInPages': {
        get: function() {
          return this.resourceType === constants.RESOURCE_IN_PAGES_TYPE;
        }
      },
      'isInFlows': {
        get: function() {
          return this.resourceType === constants.RESOURCE_IN_FLOWS_TYPE;
        }
      },
    });
  }

  isEqual = (testDeclarationsInFile) => {
    return isEqual(testDeclarationsInFile.declarations, this.declarations);
  };

  cloneWithEmptyDeclarations = () => {
    return new DeclarationsInFile(this.resourceType, [], this.filePath);
  };
}

export default DeclarationsInFile;
