const getUserByEmail = function (email, database) {
  for (let userKey in database) {
    if (email == database[userKey].email) {
      return database[userKey];
    }
  }
  return null;
};

const generateRandUrl = () => {
  const randUrl = Math.random().toString(36).slice(2, 8);
  return randUrl;
};

module.exports = { getUserByEmail, generateRandUrl };
