import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../../../infrastructure/date/date.port';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { memberDevices } from '../../schema';

import { InsertMemberDeviceModel, MemberDeviceRepository } from './member-device.repository';

export class SqlMemberDeviceRepository implements MemberDeviceRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(
    private readonly database: Database,
    private readonly dateAdapter: DatePort,
  ) {}

  private get db() {
    return this.database.db;
  }

  async register(model: InsertMemberDeviceModel): Promise<void> {
    await this.db
      .insert(memberDevices)
      .values({
        ...model,
        deviceSubscription: JSON.stringify(model.deviceSubscription),
        createdAt: this.dateAdapter.now(),
        updatedAt: this.dateAdapter.now(),
      })
      .onConflictDoNothing();
  }

  async getMemberDeviceSubscriptions(memberId: string): Promise<unknown[]> {
    const results = await this.db.select().from(memberDevices).where(eq(memberDevices.memberId, memberId));

    return results.map((result) => JSON.parse(result.deviceSubscription));
  }
}
