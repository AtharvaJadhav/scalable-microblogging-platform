import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsTwoFactorEnabledToUser1701569473814
  implements MigrationInterface
{
  name = "AddIsTwoFactorEnabledToUser1701569473814";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isTwoFactorEnabled" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "isTwoFactorEnabled"`
    );
  }
}
