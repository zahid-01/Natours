module.exports = class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObject = { ...this.queryStr };
    const excludeFileds = ['page', 'sort', 'limit', 'fields'];
    excludeFileds.forEach((el) => delete queryObject[el]);

    //Build a query
    let queryStr = JSON.stringify(queryObject);

    queryStr = JSON.parse(queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`));
    this.query.find(queryStr);

    return this;
  }

  //1)SORTING
  sort() {
    if (this.queryStr.sort) {
      const sortBY = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBY);
    } else this.query = this.query.sort('-createdAt');
    return this;
  }

  //2)LIMITING FIELDS
  limitingFields() {
    if (this.queryStr.fields) {
      const sendFIelds = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(sendFIelds);
    } else this.query = this.query.select('-__v');
    return this;
  }

  //3)PAGINATION
  paginate() {
    const limit = this.queryStr.limit * 1 || 0;
    const page = this.queryStr.page * 1 || 1;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};
