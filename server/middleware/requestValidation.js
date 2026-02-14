import Joi from "joi";

const defaultJoiOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

const formatJoiErrors = (error) => {
  return error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));
};

export const validateRequest = (schemas = {}) => {
  const { body, query, params, options = {} } = schemas;
  const joiOptions = { ...defaultJoiOptions, ...options };

  return (req, res, next) => {
    const errors = [];

    if (body) {
      const { error, value } = body.validate(req.body, joiOptions);
      if (error) {
        errors.push(...formatJoiErrors(error));
      } else {
        req.body = value;
      }
    }

    if (query) {
      const { error, value } = query.validate(req.query, joiOptions);
      if (error) {
        errors.push(...formatJoiErrors(error));
      } else {
        req.query = value;
      }
    }

    if (params) {
      const { error, value } = params.validate(req.params, joiOptions);
      if (error) {
        errors.push(...formatJoiErrors(error));
      } else {
        req.params = value;
      }
    }

    if (errors.length) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
};

export { Joi };
