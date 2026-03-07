import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('product_variants', {
        id: {
            type: 'serial',
            primaryKey: true,
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
        }
    })
}