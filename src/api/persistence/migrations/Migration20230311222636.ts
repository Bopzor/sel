import { Migration } from '@mikro-orm/migrations';

export class Migration20230311222636 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "members" ("id" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "phone_number" varchar(255) not null, "address" jsonb not null, constraint "members_pkey" primary key ("id"));');

    this.addSql('create table "requests" ("id" varchar(255) not null, "requester_id" varchar(255) not null, "title" varchar(255) not null, "description" text not null, "creation_date" timestamptz(0) not null, "last_edition_date" timestamptz(0) not null, constraint "requests_pkey" primary key ("id"));');

    this.addSql('alter table "requests" add constraint "requests_requester_id_foreign" foreign key ("requester_id") references "members" ("id") on update cascade;');
  }

}
