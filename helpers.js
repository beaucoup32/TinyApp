const getUserByEmail = function(email, database) {
  for (let userKey in database) {
    if (email == database[userKey].email) {
      return database[userKey];
    }
  }
  return null;
};

module.exports = {getUserByEmail}