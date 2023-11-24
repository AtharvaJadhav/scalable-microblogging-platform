import { MigrationInterface, QueryRunner } from "typeorm";

export class New1630353813625 implements MigrationInterface {
  name = "New1630353813625";

  public async up(_: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE "post" ADD "imgUrl" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "imgUrl"`);
  }
}
