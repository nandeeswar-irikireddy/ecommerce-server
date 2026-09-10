import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('product_option_values', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        option_id: {
            type: 'integer',
            references: 'product_options(id)',
            notNull: true,
            onDelete: 'CASCADE'
        },
        value: {
            type: 'varchar',
            notNull: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })

    pgm.addConstraint(
        'product_option_values',
        'uq_product_option_values_option_value',
        {
            unique: ['option_id', 'value'],
        }
    );

    pgm.addConstraint(
        'product_option_values',
        'uq_product_option_values_option_id',
        {
            unique: ['option_id', 'id'],
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> { }
