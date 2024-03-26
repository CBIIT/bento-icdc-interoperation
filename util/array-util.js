module.exports = {
  /**
   * Filters an array of objects based on a specific property and key.
   *
   * @param {Object[]} array - Array of objects to be filtered.
   * @param {string} property - Property of each object to check for presence of key.
   * @param {string} key - Key to search for within the specified property.
   * @returns {Object[]} - Array containing only the objects whose specified property includes the given key.
   */
  filterObjectArray(array, property, key) {
    return array.filter((obj) => {
      return obj[property].includes(key);
    });
  },
  /**
   * Filters an array of objects by selecting only specified properties.
   *
   * @param {Object[]} array - Array of objects to filter.
   * @param {string[]} targetProps - Array of property names to include in the filtered objects.
   * @returns {Object[]} - Array containing filtered objects with only the specified properties.
   */
  filterObjectArrayByProps(array, targetProps) {
    return array.map((item) =>
      Object.keys(item)
        .filter((key) => targetProps.includes(key))
        .reduce((obj, key) => {
          return Object.assign(obj, { [key]: item[key] });
        }, {})
    );
  },
  /**
   * Converts an array of objects into a CSV string.
   * NOTE: Does not handle values containing commas.
   *
   * @param {Object[]} objectArray - Array of objects to be converted into CSV.
   * @returns {string} - CSV string representing the provided array of objects.
   */
  convertObjectArrayToCsv(objectArray) {
    arrayWithHeaders = [Object.keys(objectArray[0])].concat(objectArray);
    return arrayWithHeaders
      .map((item) => {
        return Object.values(item).toString();
      })
      .join("\n");
  },
};
