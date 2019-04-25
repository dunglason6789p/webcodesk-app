import * as constants from '../../commons/constants';

export function offset(el) {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    right: rect.right + scrollLeft,
    bottom: rect.bottom + scrollTop }
}

export function getComponentName(canonicalComponentName) {
  const titleParts = canonicalComponentName ? canonicalComponentName.split('.') : [];
  if (titleParts.length > 0) {
    return titleParts[titleParts.length - 1];
  }
  return canonicalComponentName;
}

export function cutText(text, limit = 25) {
  if (text && text.length >= limit) {
    return text.substr(0, limit - 3) + '...';
  }
  return text;
}

export function cutFilePath(filePath, limit = 60, trimTo = 5) {
  let result = filePath;
  if (result && result.length > limit && trimTo > 1) {
    const parts = result.split(constants.FILE_SEPARATOR);
    if (parts && parts.length > trimTo) {
      result = `.../${parts.slice(parts.length - trimTo, parts.length).join(constants.FILE_SEPARATOR)}`;
      if (result.length > limit) {
        return cutFilePath(result, limit, trimTo - 1);
      }
    }
  }
  return result;
}
