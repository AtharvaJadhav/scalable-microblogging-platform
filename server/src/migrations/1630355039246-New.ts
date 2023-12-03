import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTwoFactorAuthSecretToUser1630355039246
  implements MigrationInterface
{
  name = "AddTwoFactorAuthSecretToUser1630355039246";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "twoFactorAuthSecret" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "twoFactorAuthSecret"`
    );
  }
}
