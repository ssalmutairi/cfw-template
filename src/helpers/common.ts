// write function to hash password and compare password
// use web crypto api to hash password
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
};
