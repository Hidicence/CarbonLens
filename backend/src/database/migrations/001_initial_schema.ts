import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 創建用戶表
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.string('organization');
    table.timestamps(true, true);
  });

  // 創建專案表
  await knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.string('location');
    table.enum('status', ['planning', 'active', 'paused', 'completed']).defaultTo('planning');
    table.date('start_date').notNullable();
    table.date('end_date');
    table.decimal('budget', 15, 2);
    table.string('category');
    table.json('carbon_budget');
    table.timestamps(true, true);
  });

  // 創建排放記錄表
  await knex.schema.createTable('emission_records', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').nullable();
    table.decimal('amount', 15, 4).notNullable();
    table.string('category').notNullable();
    table.string('subcategory');
    table.text('description').notNullable();
    table.date('date').notNullable();
    table.enum('stage', ['pre-production', 'production', 'post-production']);
    table.string('equipment');
    table.string('location');
    table.json('metadata');
    table.timestamps(true, true);
  });

  // 創建營運記錄表
  await knex.schema.createTable('operational_records', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.decimal('amount', 15, 4).notNullable();
    table.string('category').notNullable();
    table.string('subcategory');
    table.text('description').notNullable();
    table.date('date').notNullable();
    table.string('location');
    table.json('allocations');
    table.json('metadata');
    table.timestamps(true, true);
  });

  // 創建拍攝日記錄表
  await knex.schema.createTable('shooting_day_records', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.date('shooting_date').notNullable();
    table.string('location').notNullable();
    table.text('description');
    table.integer('crew_count');
    table.json('equipment_list');
    table.json('transport_data');
    table.json('accommodation_data');
    table.json('catering_data');
    table.decimal('total_emissions', 15, 4);
    table.json('metadata');
    table.timestamps(true, true);
  });

  console.log('✅ 數據庫表創建完成');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('shooting_day_records');
  await knex.schema.dropTableIfExists('operational_records');
  await knex.schema.dropTableIfExists('emission_records');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('users');
  
  console.log('✅ 數據庫表已刪除');
} 