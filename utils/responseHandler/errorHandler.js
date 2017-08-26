const Response = require('./response');

function _mongoError(res, type, error) {
  if (error.code === 11000)
    return _alreadyRegistered(res, type);
  else
    return _unexpected(res, type, error)
}

function _unexpected(res, type, error) {
  console.log(error);
  res.status(500);
  const message = 'Unexpected Error'
  return res.send(new Response(500, message));
}

function _alreadyRegistered(res, type) {
  res.status(409);
  const message = {
    type: `Already registered ${type}`
  }
  return res.send(new Response(409, message));
};

function _notFound(res, type, error) {
  res.status(404);
  const message = {
    type: `Not found ${type}`
  }
  return res.send(new Response(404, message));
};

function _validation(res, type, error) {
  error = error.errors;
  const message = {
    type: `${type} Validation Error`,
    description: []
  }
  for (let i in error) {
    message
      .description
      .push(error[i].message);
  }
  res.status(401);
  return res.send(new Response(401, message));
};

function _invalidPassword(res, type, error) {
  res.status(400);
  const message = {
    type: `Invalid Password`
  };
  return res.send(new Response(400, message));
}
function _notAuthorized(res, type, error) {
  res.status(401);
  const message = {
    type: `Not Authorized`,
    description: type
  }
  return res.send(new Response(401, message));
}

module.exports = function (res, type, error) {
  switch (error.name) {
    case 'MongoError':
      return _mongoError(res, type, error);
      break;
    case 'NotFound':
      return _notFound(res, type, error);
      break;
    case 'ValidationError':
      return _validation(res, type, error);
      break;
    case 'InvalidPassword':
      return _invalidPassword(res, type, error);
    case 'NotAuthorized':
      return _notAuthorized(res, type, error);
    default:
      return _unexpected(res, type, error);
  }
};
