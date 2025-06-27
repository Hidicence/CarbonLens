import knex, { Knex } from 'knex';
import path from 'path';

let db: Knex;

export const setupDatabase = async (): Promise<Knex> => {
  const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL?.replace('sqlite:', '') || './database.sqlite'
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'ts'
    },
    // SQLite 優化配置
    pool: {
      afterCreate: (conn: any, done: Function) => {
        // 啟用外鍵約束
        conn.run('PRAGMA foreign_keys = ON', done);
      }
    }
  };

  // 如果是 PostgreSQL
  if (process.env.DATABASE_URL?.startsWith('postgresql://')) {
    config.client = 'pg';
    config.connection = process.env.DATABASE_URL;
    delete config.useNullAsDefault;
  }

  db = knex(config);

  try {
    // 測試連接
    await db.raw('SELECT 1');
    console.log('✅ 數據庫連接成功');

    // 運行遷移
    await db.migrate.latest();
    console.log('✅ 數據庫遷移完成');

    // 在開發環境下運行種子數據
    if (process.env.NODE_ENV === 'development') {
      await db.seed.run();
      console.log('✅ 種子數據已載入');
    }

  } catch (error) {
    console.error('❌ 數據庫設置失敗:', error);
    throw error;
  }

  return db;
};

export const getDatabase = (): Knex => {
  if (!db) {
    throw new Error('數據庫尚未初始化');
  }
  return db;
};

// 優雅關閉數據庫連接
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.destroy();
    console.log('✅ 數據庫連接已關閉');
  }
}; 