export type JwtPayload = {
  sub: string;
  role: string;
  federationId?: string;
  clubId?: string;
  labId?: string;
};
