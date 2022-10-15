const bcrypt = require("bcrypt");
const saltRounds = 4;
const hashPassword = async (password: string) => {
  return bcrypt.hash(password, saltRounds);
};
export default hashPassword;
