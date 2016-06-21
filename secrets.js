module.exports = function(key) {
  return process.ENV[key] || key;
}
