import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AthletesModule } from './athletes/athletes.module';
import { TestOrdersModule } from './test-orders/test-orders.module';
import { SamplesModule } from './samples/samples.module';
import { LabsModule } from './labs/labs.module';
import { LabAssignmentsModule } from './lab-assignments/lab-assignments.module';
import { TestResultsModule } from './test-results/test-results.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { FederationsModule } from './federations/federations.module';
import { ClubsModule } from './clubs/clubs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AthletesModule,
    TestOrdersModule,
    SamplesModule,
    LabsModule,
    LabAssignmentsModule,
    TestResultsModule,
    IntegrationsModule,
    FederationsModule,
    ClubsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
