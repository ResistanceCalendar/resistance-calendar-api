const createFilter = require('odata-v4-mongodb-rc').createFilter;

const createOrderBy = function (query) {
  try {
    if (query) {
      var fields, direction;
      const queryFields = query.trim().split(/[\s,]+/);
      const lastField = queryFields[queryFields.length - 1];
      if (lastField.toLowerCase() === 'asc') {
        fields = queryFields.slice(0, -1);
        direction = -1;
      } else if (lastField.toLowerCase() === 'desc') {
        fields = queryFields.slice(0, -1);
        direction = 1;
      } else {
        fields = queryFields;
        direction = -1;
      }
      const orderBy = [];
      fields.forEach(function (field) {
        orderBy.push([field, direction]);
      });
      return orderBy;
    } else {
      return [];
    }
  } catch (err) {
    if (err) console.log(err);
  }
};

exports.createFilter = createFilter;
exports.createOrderBy = createOrderBy;
