import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsGoogleUserToUser1701836996234 implements MigrationInterface {
  name = "AddIsGoogleUserToUser1701836996234";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isGoogleUser" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isGoogleUser"`);
  }
}
