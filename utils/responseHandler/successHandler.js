import Response from './response';

exports.loaded = function(res, type, data) {
  res.status(200);
  const message = `${type} successfully loaded `;
  return res.send(new Response(200, message, data));
}

exports.created = function(res, type) {
  res.status(201);
  const message = `${type} successfully created`;
  return res.send(new Response(201, message));
}

exports.updated = function(res, type) {
  res.status(200);
  const message = `${type} successfully updated`;
  return res.send(new Response(200, message));
}

exports.removed = function(res, type) {
  res.status(200);
  const message = `${type} successfully removed`;
  return res.send(new Response(200, message));
}

exports.success = function(res, type, data) {
  res.status(200);
  const message = `Successfully ${type}`;
  return res.send(new Response(200, message, data));
}
