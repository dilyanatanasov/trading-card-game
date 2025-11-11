import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardAbility1762848754967 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE cards ADD COLUMN IF NOT EXISTS ability jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE cards DROP COLUMN IF EXISTS ability;
        `);
    }

}
