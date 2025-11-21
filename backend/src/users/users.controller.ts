import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /**
   * GET /api/v1/users?q=&role=&limit=
   * Retorna itens enxutos para selects/lookup.
   * (Mantive autenticado. Se quiser público, adicione @Public())
   */
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const items = await this.users.lookup({ q, role, take });
    return { items };
  }
}
