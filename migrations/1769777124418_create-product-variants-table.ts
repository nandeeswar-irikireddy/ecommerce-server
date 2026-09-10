import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('product_variants', {
        id: {
            type: 'serial',
            primaryKey: true,
        },
        sku: {
            type: 'varchar(100)',
            notNull: true,
            unique: true
        },
        product_id: {
            type: 'integer',
            notNull: true,
            references: 'products(id)',
            onDelete: 'CASCADE',
        },
        price: {
            type: 'numeric(10,2)',
            notNull: true,
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