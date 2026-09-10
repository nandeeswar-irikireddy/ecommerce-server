import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable('variant_option_values', {
        variant_id: {
            type: 'integer',
            references: 'product_variants(id)',
            notNull: true,
        },
        option_id: {
            type: 'integer',
            references: 'product_options(id)',
            notNull: true,
        },
        option_value_id: {
            type: 'integer',
            references: 'product_option_values(id)',
            notNull: true,
        },
    });

    pgm.addConstraint(
        'variant_option_values',
        'pk_variant_option_values',
        {
            primaryKey: ['variant_id', 'option_id'],
        }
    );

    pgm.addConstraint(
        'variant_option_values',
        'fk_variant_option_value_option',
        {
            foreignKeys: {
                columns: ['option_id', 'option_value_id'],
                references: 'product_option_values(option_id, id)',
            },
        }
    );
}

export async function down(pgm: MigrationBuilder): Promise<void> { }
