module.exports = {
  filterObjectArray(array, property, key) {
    return array.filter((obj) => {
      return obj[property].includes(key);
    });
  },
};
