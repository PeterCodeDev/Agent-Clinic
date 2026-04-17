import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import path from 'path';

console.log('Applying migrations...');
migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle/migrations') });
console.log('Migrations applied successfully!');
