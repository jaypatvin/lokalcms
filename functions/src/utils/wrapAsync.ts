
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(e => {
      if (next) next(e);
    });
  };
};


export default wrapAsync;