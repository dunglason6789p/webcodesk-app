import constants from '../../commons/constants';
import * as config from '../config/config';
import { path } from '../utils/electronUtils';
import * as projectResourceFactory from './projectResourcesFactory';
import globalStore from '../../globalStore';
import ResourceAdapter from './ResourceAdapter';
import { readFileSync } from '../utils/fileUtils';

export const possibleResourceTypes = [
  constants.RESOURCE_IN_COMPONENTS_TYPE,
  constants.RESOURCE_IN_COMPONENT_STORIES_TYPE,
  constants.RESOURCE_IN_FLOWS_TYPE,
  constants.RESOURCE_IN_PAGES_TYPE,
  constants.RESOURCE_IN_USER_FUNCTIONS_TYPE,
];

export function getGraphByResourceType(resourceType) {
  let graphModel;
  switch (resourceType) {
    case constants.RESOURCE_IN_COMPONENTS_TYPE:
      graphModel = globalStore.get('userComponentsGraphModel');
      break;
    case constants.RESOURCE_IN_COMPONENT_STORIES_TYPE:
      graphModel = globalStore.get('userComponentStoriesGraphModel');
      break;
    case constants.RESOURCE_IN_USER_FUNCTIONS_TYPE:
      graphModel = globalStore.get('userFunctionsGraphModel');
      break;
    case constants.RESOURCE_IN_FLOWS_TYPE:
      graphModel =globalStore.get('flowsGraphModel');
      break;
    case constants.RESOURCE_IN_PAGES_TYPE:
      graphModel = globalStore.get('pagesGraphModel');
      break;
    default:
      throw Error('Cannot find graph model. Wrong resource type.');
  }
  return graphModel;
}

export function resourceModelComparator (a, b) {
  const { props: aProps } = a;
  const { props: bProps } = b;
  if (aProps.displayName > bProps.displayName) {
    return 1;
  }
  if (aProps.displayName < bProps.displayName) {
    return -1;
  }
  return 0;
}

export function makeResourceName (name) {
  return name.replace(
    constants.RESOURCE_NAME_INVALID_SEPARATOR_REGEXP,
    constants.RESOURCE_NAME_VALID_SEPARATOR
  );
}

export function getResourceKeysByFilePath (filePath) {
  let innerResourcePath = filePath.replace(`${config.projectRootSourceDir}${constants.FILE_SEPARATOR}`, '');
  const pathParts = innerResourcePath.split(constants.FILE_SEPARATOR);
  let prevResourceKey;
  let resourceKey;
  const treeHierarchyKeys = [];
  for (let d = 0; d < pathParts.length; d++) {
    if (prevResourceKey) {
      // combine key with file separator: dir/dir/file
      resourceKey = `${prevResourceKey}${constants.FILE_SEPARATOR}${pathParts[d]}`;
    } else {
      resourceKey = `${pathParts[d]}`;
    }
    prevResourceKey = resourceKey;
    treeHierarchyKeys.push(resourceKey);
  }
  return { resourceKey, treeHierarchyKeys };
}

export function updateResourceTree (declarationsInFile) {
  const graphModel = getGraphByResourceType(declarationsInFile.resourceType);
  const updatedResourcesKeys = [];
  const resourceKeysToDelete = [];
  let innerResourcePath =
    declarationsInFile.filePath.replace(`${config.projectRootSourceDir}${constants.FILE_SEPARATOR}`, '');
  const pathParts = innerResourcePath.split(constants.FILE_SEPARATOR);

  let isDirectory;

  let rootResourceFileModel = null;
  let prevResourceFileModel = null;
  let resourceFileModel = {};

  for (let d = 0; d < pathParts.length; d++) {

    if (prevResourceFileModel) {
      // combine key with file separator: dir/dir/file
      resourceFileModel.key = `${prevResourceFileModel.key}${constants.FILE_SEPARATOR}${pathParts[d]}`;
    } else {
      resourceFileModel.key = `${pathParts[d]}`;
    }
    resourceFileModel.props = {
      displayName: pathParts[d],
      resourceType: declarationsInFile.resourceType,
    };

    isDirectory = d < pathParts.length - 1;
    if (isDirectory) {
      resourceFileModel.type = constants.GRAPH_MODEL_DIR_TYPE;
      resourceFileModel.props.importPath = resourceFileModel.key;
      resourceFileModel.props.indexImportPath = resourceFileModel.key;
      resourceFileModel.props.name = pathParts[d];
      resourceFileModel.props.absolutePath =
        `${config.projectRootSourceDir}${constants.FILE_SEPARATOR}${resourceFileModel.key}`;
    } else {
      resourceFileModel.type = constants.GRAPH_MODEL_FILE_TYPE;
      const pathParsed = path().parse(innerResourcePath);
      // the name attribute serves as the default import object in indices tree,
      // we have to get rid of the bad characters in it
      resourceFileModel.props.name = makeResourceName(pathParsed.name);
      resourceFileModel.props.importPath =
        `${pathParsed.dir}${constants.FILE_SEPARATOR}${pathParsed.name}`;
      // indexImportPath is used in index generator for making index file import structure inside indices tree
      resourceFileModel.props.indexImportPath =
        `${pathParsed.dir}${constants.FILE_SEPARATOR}${makeResourceName(pathParsed.name)}`;
      resourceFileModel.props.absolutePath = declarationsInFile.filePath;
      if (declarationsInFile.hasDeclarations) {
        // model key is used to get access to the certain resource (function, component, etc.)
        // through the lodash get in the indices tree
        // so, we have to get rig of the invalid characters in the resource name
        let modelKey =
          pathParsed.dir.replace(constants.FILE_SEPARATOR_REGEXP, constants.MODEL_KEY_SEPARATOR)
          + `${constants.MODEL_KEY_SEPARATOR}${makeResourceName(pathParsed.name)}`;
        // merge children if they were here
        resourceFileModel.children = resourceFileModel.children || [];
        if (declarationsInFile.isInUserFunctions) {
          resourceFileModel.children =
            resourceFileModel.children.concat(
              projectResourceFactory.createFunctionsModels(modelKey, declarationsInFile, pathParsed.name)
            );
        }
        if (declarationsInFile.isInComponents) {
          resourceFileModel.children =
            resourceFileModel.children.concat(
              projectResourceFactory.createComponentsModels(modelKey, declarationsInFile)
            );
        }
        if (declarationsInFile.isInComponentStories) {
          resourceFileModel.children =
            resourceFileModel.children.concat(
              projectResourceFactory.createComponentStoriesModels(modelKey, declarationsInFile)
            );
        }
        if (declarationsInFile.isInPages) {
          resourceFileModel.children =
            resourceFileModel.children.concat(
              projectResourceFactory.createPageModels(modelKey, declarationsInFile)
            );
        }
        if (declarationsInFile.isInFlows) {
          resourceFileModel.children =
            resourceFileModel.children.concat(
              projectResourceFactory.createFlowModels(modelKey, declarationsInFile)
            );
        }
      }
      // remove all children for the sake of the declaration signature is changed or deleted in the file
      graphModel.deleteChildren(resourceFileModel.key);
      updatedResourcesKeys.push(resourceFileModel.key);
      if(!declarationsInFile.hasDeclarations) {
        resourceKeysToDelete.push(resourceFileModel.key)
      }
    }

    if (prevResourceFileModel) {
      prevResourceFileModel.children = prevResourceFileModel.children || [];
      prevResourceFileModel.children.push(resourceFileModel);
    } else {
      rootResourceFileModel = resourceFileModel;
    }
    prevResourceFileModel = resourceFileModel;
    resourceFileModel = {};
  }
  graphModel.addChildNodeToRoot(rootResourceFileModel);

  const updatedResources = [];
  if (updatedResourcesKeys.length > 0) {
    updatedResourcesKeys.forEach(updatedResourcesKey => {
      updatedResources.push(getResource(updatedResourcesKey, declarationsInFile.resourceType));
    });
  }

  const resourcesToDelete = [];
  if (resourceKeysToDelete.length > 0) {
    resourceKeysToDelete.forEach(resourceKeyToDelete => {
      resourcesToDelete.push(getResource(resourceKeyToDelete, declarationsInFile.resourceType));
    });
  }

  return { updatedResources, resourcesToDelete };
}

function deleteResource (resource, forceToDelete = false) {
  let deleteCount = 0;
  let deletedResource = resource;
  if (!deletedResource.isEmpty) {
    let graphModel = getGraphByResourceType(resource.resourceType);
    if (forceToDelete) {
      graphModel.deleteChildren(resource.key);
      graphModel.deleteNode(resource.key);
      deleteCount++;
    } else {
      if (deletedResource.hasChildren === 0) {
        graphModel.deleteNode(resource.key);
        deleteCount++;
      }
    }
  }
  return deleteCount > 0 ? deletedResource : undefined;
}

// export function deleteResourceByKey (resourceKey, forceToDelete = false) {
//   let deleteCount = 0;
//   let deletedResource = getResource(resourceKey);
//   if (!deletedResource.isEmpty) {
//     deletedResource.resourceTypesArray.forEach(resourceType => {
//       let graphModel = getGraphByResourceType(resourceType);
//       if (forceToDelete) {
//         graphModel.deleteChildren(resourceKey);
//         graphModel.deleteNode(resourceKey);
//         deleteCount++;
//       } else {
//         if (deletedResource.hasChildren === 0) {
//           graphModel.deleteNode(resourceKey);
//           deleteCount++;
//         }
//       }
//     });
//   }
//   return deleteCount > 0 ? deletedResource : undefined;
// }

export function eraseResource (resource) {
  let deletedResources = [];
  // this resource should be deleted by force
  const deletedResource = deleteResource(resource, true);
  if (deletedResource) {
    deletedResources.push(deletedResource);
  }
  return deletedResources;
}

// export function eraseResourceByKey (resourceKey) {
//   let deletedResources = [];
//   // this resource should be deleted by force
//   const deletedResource = deleteResourceByKey(resourceKey, true);
//   deletedResources.push(deletedResource);
//   return compact(deletedResources);
// }

export function cleanAllGraphs() {
  let graphModel;
  let postOrderedKeys;
  let testedNode;
  possibleResourceTypes.forEach(resourceType => {
    graphModel = getGraphByResourceType(resourceType);
    if (graphModel) {
      postOrderedKeys = graphModel.getPostorderKeys();
      if (postOrderedKeys && postOrderedKeys.length > 0) {
        postOrderedKeys.forEach(postOrderKey => {
          testedNode = graphModel.getNode(postOrderKey);
          if (testedNode.type === constants.GRAPH_MODEL_DIR_TYPE
            && graphModel.getChildrenCount(postOrderKey) === 0) {
            graphModel.deleteNode(postOrderKey);
          }
        });
      }
    }
  });
}

export function getResource (resourceKey, concreteResourceType = null) {
  return new ResourceAdapter.Builder()
    .byKeyInGraphs(resourceKey, getGraphByResourceType, concreteResourceType)
    .withComponentStories(getUserComponentStories(resourceKey))
    .build();
}

export function getResourceSource(resource) {
  let result = null;
  if (resource && resource.absolutePath) {
    try {
      result = readFileSync(resource.absolutePath);
    } catch (e) {
      console.error('Reading resource source code.', e);
    }
  }
  return result;
}

function getUserComponentStories (resourceKey) {
  const graphModel = getGraphByResourceType(constants.RESOURCE_IN_COMPONENTS_TYPE);
  if (graphModel) {
    const resourceModel = graphModel.getNode(resourceKey);
    if (resourceModel && resourceModel.type === constants.GRAPH_MODEL_COMPONENT_TYPE) {
      // get file model now
      const parentKey = graphModel.getParentKey(resourceModel.key);
      if (parentKey) {
        const parentResourceModel = graphModel.getNode(parentKey);
        if (parentResourceModel && parentResourceModel.type === constants.GRAPH_MODEL_FILE_TYPE) {
          const parsedFilePath = path().parse(parentResourceModel.key);
          const componentStoriesFilePath =
            `${parsedFilePath.dir}${constants.FILE_SEPARATOR}${parsedFilePath.name}.stories${parsedFilePath.ext}`;
          const storiesGraphModel = getGraphByResourceType(constants.RESOURCE_IN_COMPONENT_STORIES_TYPE);
          if (storiesGraphModel) {
            const componentStoriesFileModel = storiesGraphModel.getNode(componentStoriesFilePath);
            if (componentStoriesFileModel) {
              const componentStoriesFile = storiesGraphModel.extractModel(componentStoriesFilePath);
              if (componentStoriesFile) {
                const { children } = componentStoriesFile;
                if (children && children.length > 0) {
                  // the stories file should have only one child with all stories described
                  return children[0];
                }
              }
            }
          }
        }
      }
    }
  }
  return {};
}

function visitForPages ({nodeModel}) {
  const result = [];
  if (nodeModel && nodeModel.type === constants.GRAPH_MODEL_PAGE_TYPE) {
    const {props: {pagePath, pageName, metaData}} = nodeModel;
    result.push({
      pagePath,
      pageName,
      metaData,
    });
  }
  return result;
}

export function getAllPagesList () {
  const graphModel = getGraphByResourceType(constants.RESOURCE_IN_PAGES_TYPE);
  if (graphModel) {
    return graphModel.traverse(visitForPages).sort((a, b) => a.pagePath.localeCompare(b.pagePath));
  }
  return [];
}

const visitToFindByText = (text) => ({nodeModel}) => {
  const result = [];
  if (nodeModel) {
    const {key, props: {displayName}} = nodeModel;
    if (text && displayName && displayName.toUpperCase().indexOf(text.toUpperCase()) >= 0) {
      result.push(key);
    }
  }
  return result;
};

export function findResourcesKeysByText (text) {
  let keys = [];
  let graphModel;
  possibleResourceTypes.forEach(resourceType => {
    graphModel = getGraphByResourceType(resourceType);
    keys = keys.concat(graphModel.traverse(visitToFindByText(text)));
  });
  return keys;
}

export function getResourceTree (resourceType, resourceKey = null) {
  const graphModel = getGraphByResourceType(resourceType);
  if (resourceKey) {
    return graphModel.extractModel(resourceKey, false, resourceModelComparator);
  }
  return graphModel.getModel(false, resourceModelComparator);
}

export function getResourceParents (resourceType, resourceKey) {
  const graphModel = getGraphByResourceType(resourceType);
  return graphModel.getAllParentNodes(resourceKey);
}

export function getResourceParent (resourceType, resourceKey) {
  const graphModel = getGraphByResourceType(resourceType);
  return graphModel.getParentNode(resourceKey);
}

export function getResourceMatchProps (resourceType, testResourceProps) {
  const graphModel = getGraphByResourceType(resourceType);
  return graphModel.findAllNodesMatch(testResourceProps);
}
