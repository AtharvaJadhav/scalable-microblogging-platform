import {MigrationInterface, QueryRunner} from "typeorm";

export class New1630355039245 implements MigrationInterface {
    name = 'New1630355039245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "imgUrl"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "imgUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "imgUrl"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "imgUrl" character varying NOT NULL`);
    }

}
