import bcrypt from "bcrypt";
const saltRounds = 4;
export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
