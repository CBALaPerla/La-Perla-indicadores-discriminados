import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const weeklyRecords=sqliteTable('weekly_records',{
  id:text('id').primaryKey(),
  year:integer('year').notNull(),
  month:integer('month').notNull(),
  week:integer('week').notNull(),
  weekLabel:text('week_label').notNull(),
  valuesJson:text('values_json').notNull(),
  monthClosed:integer('month_closed',{mode:'boolean'}).notNull().default(false),
  revision:integer('revision').notNull().default(1),
  updatedAt:text('updated_at').notNull(),
},t=>[uniqueIndex('weekly_records_period').on(t.year,t.month,t.week)]);
export const annualDatasets=sqliteTable('annual_datasets',{
  year:integer('year').primaryKey(),
  filename:text('filename').notNull(),
  fileKey:text('file_key').notNull(),
  dataJson:text('data_json').notNull(),
  revision:integer('revision').notNull().default(1),
  updatedAt:text('updated_at').notNull(),
});
export const adminSessions=sqliteTable('admin_sessions',{
  tokenHash:text('token_hash').primaryKey(),
  ownerId:text('owner_id').notNull(),
  expiresAt:integer('expires_at').notNull(),
});
export const adminAttempts=sqliteTable('admin_attempts',{
  ownerId:text('owner_id').primaryKey(),
  startedAt:integer('started_at').notNull(),
  attempts:integer('attempts').notNull().default(0),
});
