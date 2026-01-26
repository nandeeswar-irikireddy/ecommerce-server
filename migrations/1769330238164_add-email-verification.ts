import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumn('users', {
        emailVerified: {
            type: 'boolean',
            notNull: true,
            default: false
        }
    });

    pgm.createTable('email_verification_tokens', {
        id: { type: 'serial', primaryKey: true },
        userId: {
            type: 'integer',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE'
        },
        token: { type: 'text', notNull: true, unique: true },
        createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        expiresAt: { type: 'timestamp', notNull: true }
    })
}