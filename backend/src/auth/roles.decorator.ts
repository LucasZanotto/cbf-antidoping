import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export type AppRole = 'ADMIN_CBF' | 'FED_USER' | 'CLUB_USER' | 'LAB_USER' | 'REGULATOR' | 'AUDITOR';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
