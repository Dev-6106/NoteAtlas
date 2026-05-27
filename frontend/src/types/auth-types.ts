/** Canonical user data shape stored in localStorage after auth */
export interface UserData {
  _id: string;
  name: string;
  email: string;
  image: string;
  googleAccessToken?: string;
}

/** Full auth data returned from the server */
export interface AuthDataType {
  _id: string;
  name: string;
  email: string;
  image: string;
  googleAccessToken: string;
  googleRefreshToken: string;
  googleId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  token: {
    accessToken: string;
    refreshToken: string;
  };
}
