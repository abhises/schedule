export type User = {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
  firstName?: string;
  lastName?: string;
};
