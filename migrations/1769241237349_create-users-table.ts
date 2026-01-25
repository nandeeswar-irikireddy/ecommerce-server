import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        userName: { type: 'varchar(30)', notNull: true},
        email: { type: 'varchar(100)', notNull: true, unique: true },
        passwordHash: { type: 'varchar(255)', notNull: true },
        createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    });
}
