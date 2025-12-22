export type User = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  firstName?: string;
  lastName?: string;
};
