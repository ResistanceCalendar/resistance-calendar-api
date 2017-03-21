module.exports = {
  mongoUri: process.env.MONGOLAB_ROSE_URI || process.env.MONGOLAB_URI || process.env.MONGODB_URI
};
