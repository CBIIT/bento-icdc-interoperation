module.exports = {
  filterObjectArray(array, property, key) {
    return array.filter((obj) => {
      return obj[property].includes(key);
    });
  },
  filterObjectArrayByProps(array, targetProps) {
    return array.map((item) =>
      Object.keys(item)
        .filter((key) => targetProps.includes(key))
        .reduce((obj, key) => {
          return Object.assign(obj, { [key]: item[key] });
        }, {})
    );
  },
  convertObjectArrayToCsv(objectArray) {
    arrayWithHeaders = [Object.keys(objectArray[0])].concat(objectArray);
    return arrayWithHeaders
      .map((item) => {
        return Object.values(item).toString();
      })
      .join("\n");

    //   console.error("objectArray:  ", objectArray);
    // console.error("objectArray type:  ", typeof objectArray);
    // console.error("objectArray length:  ", objectArray.length);
    // try {
    //   arrayWithHeaders = [Object.keys(objectArray[0])].concat(objectArray);
    //   console.error(arrayWithHeaders);
    //   return arrayWithHeaders
    //     .map((item) => {
    //       return Object.values(item).toString();
    //     })
    //     .join("\n");
    // } catch (error) {
    //   console.error(error);
    //   return error;
    // }
  },
};
