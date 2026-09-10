import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('products', {
        id: {
            type: 'serial',
            primaryKey: true,
        },
        code: {
            type: 'varchar(100)',
            notNull: true,
            unique: true,
        },
        name: {
            type: 'varchar(100)',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: false,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
}
