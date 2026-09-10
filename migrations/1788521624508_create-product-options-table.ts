import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('product_options', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        name: {
            type: 'varchar(100)',
            notNull: true,
            unique: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
