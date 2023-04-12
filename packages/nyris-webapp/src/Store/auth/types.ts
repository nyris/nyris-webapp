export interface InitialStateTypes {
  accessToken?: string | Record<string, unknown> | null;
  name?: string | null;
  role?: string | null;
}

export interface LoginResponse {
  access_token?: string | Record<string, unknown> | null;
  name?: string | null;
  role?: string | null;
}
