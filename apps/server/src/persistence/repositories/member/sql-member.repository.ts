import * as shared from '@sel/shared';
import { entries, identity, toObject } from '@sel/utils';
import { injectableClass } from 'ditox';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import { NotificationDeliveryType } from '../../../common/notification-delivery-type';
import { DatePort } from '../../../infrastructure/date/date.port';
import { Address, Member, MemberStatus, PhoneNumber } from '../../../members/member.entity';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { interests, members, membersInterests } from '../../schema';

import { InsertMemberModel, MemberRepository, UpdateMemberModel } from './member.repository';

type MemberWithInterests = typeof members.$inferSelect & {
  memberInterests: Array<
    typeof membersInterests.$inferSelect & {
      interest: typeof interests.$inferSelect;
    }
  >;
};

export class SqlMemberRepository implements MemberRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(
    private database: Database,
    private readonly dateAdapter: DatePort,
  ) {}

  private get db() {
    return this.database.db;
  }

  private get tx() {
    return this.database.transaction;
  }

  async query_listMembers(sort: shared.MembersSort): Promise<shared.Member[]> {
    const orderBy = {
      [shared.MembersSort.firstName]: asc(members.firstName),
      [shared.MembersSort.lastName]: asc(members.lastName),
      [shared.MembersSort.membershipDate]: desc(members.membershipStartDate),
    };

    const results = await this.db.query.members.findMany({
      where: eq(members.status, MemberStatus.active),
      orderBy: orderBy[sort],
      with: {
        memberInterests: {
          with: {
            interest: true,
          },
        },
      },
    });

    return results.map(this.toMemberQuery);
  }

  async query_getMember(memberId: string): Promise<shared.Member | undefined> {
    const result = await this.db.query.members.findFirst({
      where: and(eq(members.id, memberId), eq(members.status, MemberStatus.active)),
      with: {
        memberInterests: {
          with: {
            interest: true,
          },
        },
      },
    });

    if (result) {
      return this.toMemberQuery(result);
    }
  }

  async query_getAuthenticatedMember(memberId: string): Promise<shared.AuthenticatedMember | undefined> {
    const [result] = await this.db.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toAuthenticatedMemberQuery(result);
    }
  }

  private toMemberQuery(this: void, result: MemberWithInterests): shared.Member {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.emailVisible ? result.email : undefined,
      phoneNumbers: (result.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
      bio: result.bio ?? undefined,
      address: result.address ?? undefined,
      membershipStartDate: result.membershipStartDate.toISOString(),
      interests: result.memberInterests.map(
        (interest): shared.MemberInterest => ({
          id: interest.id,
          label: interest.interest.label,
          description: interest.description ?? undefined,
        }),
      ),
    };
  }

  private toAuthenticatedMemberQuery(
    this: void,
    result: typeof members.$inferSelect,
  ): shared.AuthenticatedMember {
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      emailVisible: result.emailVisible,
      phoneNumbers: result.phoneNumbers as shared.PhoneNumber[],
      bio: result.bio ?? undefined,
      address: result.address ?? undefined,
      onboardingCompleted: result.status !== MemberStatus.onboarding,
      membershipStartDate: result.membershipStartDate.toISOString(),
      notificationDelivery: {
        email: result.notificationDelivery.includes(NotificationDeliveryType.email),
        push: result.notificationDelivery.includes(NotificationDeliveryType.push),
      },
      interests: [],
    };
  }

  async getMember(memberId: string): Promise<Member | undefined> {
    const [result] = await this.tx.select().from(members).where(eq(members.id, memberId));

    if (result) {
      return this.toMember(result);
    }
  }

  async getMembers(memberIds: string[]): Promise<Member[]> {
    if (memberIds.length === 0) {
      return [];
    }

    const results = await this.tx.select().from(members).where(inArray(members.id, memberIds));

    return results.map(this.toMember);
  }

  async getMemberFromEmail(email: string): Promise<Member | undefined> {
    const [result] = await this.tx.select().from(members).where(eq(members.email, email));

    if (result) {
      return this.toMember(result);
    }
  }

  async insert(model: InsertMemberModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.tx.insert(members).values({
      id: model.id,
      status: MemberStatus.onboarding,
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      emailVisible: true,
      phoneNumbers: [],
      bio: null,
      address: null,
      membershipStartDate: now,
      notificationDelivery: entries(model.notificationDelivery)
        .filter(([, value]) => value)
        .map(([key]) => key),
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(memberId: string, model: UpdateMemberModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.tx
      .update(members)
      .set({
        firstName: model.firstName,
        lastName: model.lastName,
        emailVisible: model.emailVisible,
        phoneNumbers: model.phoneNumbers,
        bio: model.bio ?? null,
        address: model.address ?? null,
        updatedAt: now,
      })
      .where(eq(members.id, memberId));
  }

  async setStatus(memberId: string, status: MemberStatus): Promise<void> {
    const now = this.dateAdapter.now();

    await this.tx
      .update(members)
      .set({
        status,
        updatedAt: now,
      })
      .where(eq(members.id, memberId));
  }

  async setNotificationDelivery(
    memberId: string,
    delivery: Partial<Record<NotificationDeliveryType, boolean>>,
  ): Promise<void> {
    const now = this.dateAdapter.now();

    await this.tx
      .update(members)
      .set({
        notificationDelivery: entries(delivery)
          .filter(([, value]) => value)
          .map(([key]) => key),
        updatedAt: now,
      })
      .where(eq(members.id, memberId));
  }

  private toMember(this: void, result: typeof members.$inferSelect): Member {
    return {
      id: result.id,
      status: result.status,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      emailVisible: result.emailVisible,
      phoneNumbers: result.phoneNumbers as PhoneNumber[],
      bio: result.bio ?? undefined,
      address: (result.address as Address | null) ?? undefined,
      membershipStartDate: result.membershipStartDate,
      notificationDelivery: toObject(Object.values(NotificationDeliveryType), identity, (type) =>
        result.notificationDelivery.includes(type),
      ),
    };
  }
}
