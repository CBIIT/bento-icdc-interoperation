module.exports = {
    removeTrailingSlashes: (path) => {
      if (path) {
        pathStr = path.toString();
        return pathStr.replace(/\\+$/, '');
      } else {
        return path;
      }
    }
  };