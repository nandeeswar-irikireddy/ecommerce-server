import { configDotenv } from 'dotenv';
configDotenv();

import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});


const PRODUCT_COUNT = 1000;

const optionDefinitions = [
    {
        name: 'Color',
        values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Grey'],
    },
    {
        name: 'Size',
        values: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
        name: 'Storage',
        values: ['64GB', '128GB', '256GB', '512GB'],
    },
];

const productTemplates = [
    {
        prefix: 'TSHIRT',
        name: 'Classic T-Shirt',
        description: 'Comfortable everyday cotton t-shirt.',
        price: 599,
        options: ['Color', 'Size'],
    },
    {
        prefix: 'SHIRT',
        name: 'Casual Shirt',
        description: 'A comfortable casual shirt suitable for everyday wear.',
        price: 999,
        options: ['Color', 'Size'],
    },
    {
        prefix: 'JEANS',
        name: 'Slim Fit Jeans',
        description: 'Classic slim-fit jeans for everyday wear.',
        price: 1499,
        options: ['Color', 'Size'],
    },
    {
        prefix: 'SHOES',
        name: 'Running Shoes',
        description: 'Lightweight running shoes designed for everyday training.',
        price: 2499,
        options: ['Color', 'Size'],
    },
    {
        prefix: 'JACKET',
        name: 'Lightweight Jacket',
        description: 'Lightweight jacket for casual outdoor use.',
        price: 1999,
        options: ['Color', 'Size'],
    },
    {
        prefix: 'BAG',
        name: 'Everyday Backpack',
        description: 'Spacious backpack for work, travel and everyday use.',
        price: 1299,
        options: ['Color'],
    },
    {
        prefix: 'BOTTLE',
        name: 'Stainless Steel Bottle',
        description: 'Durable stainless steel bottle for everyday use.',
        price: 499,
        options: ['Color'],
    },
    {
        prefix: 'HEADPHONES',
        name: 'Wireless Headphones',
        description: 'Wireless headphones with comfortable all-day listening.',
        price: 2999,
        options: ['Color'],
    },
    {
        prefix: 'PHONE',
        name: 'Smartphone',
        description: 'Modern smartphone with a high-resolution display.',
        price: 24999,
        options: ['Color', 'Storage'],
    },
    {
        prefix: 'LAPTOP',
        name: 'Everyday Laptop',
        description: 'Reliable laptop for work, study and everyday computing.',
        price: 54999,
        options: ['Color', 'Storage'],
    },
];

type Option = {
    id: number;
    name: string;
};

type OptionValue = {
    id: number;
    optionId: number;
    value: string;
};

function randomItem<T>(items: T[]): T {
    const item = items[Math.floor(Math.random() * items.length)];

    if (item === undefined) {
        throw new Error('Cannot select a random item from an empty array');
    }

    return item;
}

function randomPrice(basePrice: number): number {
    const variation = Math.floor(Math.random() * 5) * 100;
    return basePrice + variation;
}

async function getOrCreateOption(
    name: string,
    values: string[],
): Promise<{
    option: Option;
    optionValues: OptionValue[];
}> {
    const optionResult = await client.query<Option>(
        `
        INSERT INTO product_options (name)
        VALUES ($1)
        ON CONFLICT (name)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id, name
        `,
        [name],
    );

    const option = optionResult.rows[0];

    if (!option) {
        throw new Error(`Failed to create or retrieve option "${name}"`);
    }

    const optionValues: OptionValue[] = [];

    for (const value of values) {
        const result = await client.query<OptionValue>(
            `
            INSERT INTO product_option_values (option_id, value)
            VALUES ($1, $2)
            ON CONFLICT (option_id, value)
            DO UPDATE SET value = EXCLUDED.value
            RETURNING id, option_id AS "optionId", value
            `,
            [option.id, value],
        );

        const optionValue = result.rows[0];

        if (!optionValue) {
            throw new Error(
                `Failed to create or retrieve option value "${value}"`,
            );
        }

        optionValues.push(optionValue);
    }

    return {
        option,
        optionValues,
    };
}

async function seed(): Promise<void> {
    await client.connect();

    try {
        await client.query('BEGIN');

        /*
         * 1. Create / retrieve options and their values
         */

        const options = new Map<
            string,
            {
                option: Option;
                values: OptionValue[];
            }
        >();

        for (const definition of optionDefinitions) {
            const result = await getOrCreateOption(
                definition.name,
                definition.values,
            );

            options.set(definition.name, {
                option: result.option,
                values: result.optionValues,
            });
        }

        /*
         * 2. Create products
         */

        for (let i = 1; i <= PRODUCT_COUNT; i++) {
            const templateIndex =
                (i - 1) % productTemplates.length;

            const template = productTemplates[templateIndex];

            if (!template) {
                throw new Error(
                    `Product template not found for index ${templateIndex}`,
                );
            }

            const productCode = `${template.prefix}-${String(i).padStart(4, '0')}`;

            const productResult = await client.query<{ id: number }>(
                `
                INSERT INTO products (
                    code,
                    name,
                    description
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (code)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description
                RETURNING id
                `,
                [
                    productCode,
                    `${template.name} ${i}`,
                    template.description,
                ],
            );

            const product = productResult.rows[0];

            if (!product) {
                throw new Error(
                    `Failed to create or retrieve product "${productCode}"`,
                );
            }

            const productId = product.id;

            /*
             * --------------------------------------------------------
             * 3. Create variants
             *
             * Every product gets at least one variant.
             * Products with options get multiple variants.
             * --------------------------------------------------------
             */

            const selectedOptions = template.options.map((optionName) => {
                const optionData = options.get(optionName);

                if (!optionData) {
                    throw new Error(
                        `Option "${optionName}" was not found`,
                    );
                }

                return optionData;
            });

            /*
             * Simple products:
             * one variant with no option values.
             */

            if (selectedOptions.length === 0) {
                await client.query(
                    `
                    INSERT INTO product_variants (
                        sku,
                        product_id,
                        price
                    )
                    VALUES ($1, $2, $3)
                    ON CONFLICT (sku)
                    DO NOTHING
                    `,
                    [
                        `${productCode}-DEFAULT`,
                        productId,
                        randomPrice(template.price),
                    ],
                );

                continue;
            }

            /*
             * Generate a handful of variants for each configurable
             * product rather than every possible combination.
             */

            const variantCount =
                selectedOptions.length === 1 ? 3 : 6;

            for (
                let variantIndex = 1;
                variantIndex <= variantCount;
                variantIndex++
            ) {
                const selectedValues = selectedOptions.map((optionData) => {
                    return {
                        option: optionData.option,
                        value: randomItem(optionData.values),
                    };
                });

                const skuParts = selectedValues.map(
                    ({ value }) =>
                        value.value
                            .replace(/\s+/g, '-')
                            .toUpperCase(),
                );

                const sku = `${productCode}-${skuParts.join('-')}`;

                /*
                 * Because random combinations can repeat, check whether
                 * this variant already exists for this product.
                 */

                const existingVariant = await client.query<{ id: number }>(
                    `
                    SELECT id
                    FROM product_variants
                    WHERE sku = $1
                    `,
                    [sku],
                );

                if (existingVariant.rowCount !== null && existingVariant.rowCount > 0) {
                    continue;
                }

                const variantResult = await client.query<{ id: number }>(
                    `
                    INSERT INTO product_variants (
                        sku,
                        product_id,
                        price
                    )
                    VALUES ($1, $2, $3)
                    RETURNING id
                    `,
                    [
                        sku,
                        productId,
                        randomPrice(template.price),
                    ],
                );

                const variant = variantResult.rows[0];

                if (!variant) {
                    throw new Error(
                        `Failed to create variant "${sku}"`,
                    );
                }

                const variantId = variant.id;

                /*
                 * ----------------------------------------------------
                 * 4. Connect variant → option values
                 * ----------------------------------------------------
                 */

                for (const { option, value } of selectedValues) {
                    await client.query(
                        `
                        INSERT INTO variant_option_values (
                            variant_id,
                            option_id,
                            option_value_id
                        )
                        VALUES ($1, $2, $3)
                        ON CONFLICT (variant_id, option_id)
                        DO NOTHING
                        `,
                        [
                            variantId,
                            option.id,
                            value.id,
                        ],
                    );
                }
            }
        }

        await client.query('COMMIT');

        console.log(
            `Successfully seeded ${PRODUCT_COUNT} products.`,
        );
    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Seed failed:', error);

        process.exitCode = 1;
    } finally {
        await client.end();
    }
}

seed();