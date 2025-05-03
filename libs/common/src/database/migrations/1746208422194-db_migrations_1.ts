import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigrations11746208422194 implements MigrationInterface {
    name = 'DbMigrations11746208422194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."account_accounttype_enum" AS ENUM('individual', 'admin', 'super_admin', 'system')`);
        await queryRunner.query(`CREATE TYPE "public"."account_status_enum" AS ENUM('pending', 'active', 'inactive', 'shadow_banned', 'disabled')`);
        await queryRunner.query(`CREATE TABLE "account" ("id" BIGSERIAL NOT NULL, "firstName" character varying DEFAULT '', "lastName" character varying DEFAULT '', "phone" character varying DEFAULT '', "newPhone" character varying DEFAULT '', "email" character varying NOT NULL DEFAULT '', "newEmail" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL DEFAULT '', "state" character varying DEFAULT '', "stateArea" character varying DEFAULT '', "latitude" character varying DEFAULT '', "longitude" character varying DEFAULT '', "profilePhoto" character varying DEFAULT 'https://medexer.s3.amazonaws.com/avatars/avatar.png', "accountType" "public"."account_accounttype_enum" NOT NULL DEFAULT 'individual', "status" "public"."account_status_enum" NOT NULL DEFAULT 'pending', "fcmToken" character varying DEFAULT '', "referralCode" character varying DEFAULT '', "referredBy" character varying DEFAULT '', "activationCode" character varying DEFAULT '', "activationCodeExpires" TIMESTAMP, "passwordResetCode" character varying DEFAULT '', "passwordResetToken" character varying DEFAULT '', "passwordResetCodeExpires" TIMESTAMP, "temporalAccessToken" character varying DEFAULT '', "lastLogin" TIMESTAMP, "signupVerificationHash" character varying DEFAULT '', "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "referral" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "accountId" bigint, "referredUserId" bigint, CONSTRAINT "PK_a2d3e935a6591168066defec5ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" BIGSERIAL NOT NULL, "title" character varying DEFAULT '', "message" character varying DEFAULT '', "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "account" bigint, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "referral" ADD CONSTRAINT "FK_2567dc7c5028c8d393eacb8bcb7" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "referral" ADD CONSTRAINT "FK_b03e2e8eef2766e6ed730a86d63" FOREIGN KEY ("referredUserId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_7849753f8d233836613f72ad2ff" FOREIGN KEY ("account") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_7849753f8d233836613f72ad2ff"`);
        await queryRunner.query(`ALTER TABLE "referral" DROP CONSTRAINT "FK_b03e2e8eef2766e6ed730a86d63"`);
        await queryRunner.query(`ALTER TABLE "referral" DROP CONSTRAINT "FK_2567dc7c5028c8d393eacb8bcb7"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TABLE "referral"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TYPE "public"."account_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."account_accounttype_enum"`);
    }

}
