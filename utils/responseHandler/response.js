class Response {
  constructor(status, message, data) {
    this.status = status;
    this.message = message || '';
    if (data) this.data = data;
  }
}

module.exports = Response;
