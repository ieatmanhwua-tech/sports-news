/**
 * TipOffPh CLI Admin Setup Script
 * Usage on Hostinger SSH or local terminal:
 * npx tsx server/scripts/bootstrap-admin.ts <username> <email> <password>
 */
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: npx tsx server/scripts/bootstrap-admin.ts <username> <email> <password>');
    process.exit(1);
  }

  const [username, email, password] = args;

  const dbHost = process.env.DB_HOST;
  const dbPort = Number(process.env.DB_PORT || 3306);
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;

  if (!dbHost || !dbUser || !dbName) {
    console.error('Error: DB_HOST, DB_USER, and DB_NAME environment variables must be defined.');
    process.exit(1);
  }

  console.log(`Connecting to database ${dbHost}:${dbPort}/${dbName}...`);
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  });

  const hash = await bcrypt.hash(password, 12);
  const id = `usr-${Date.now()}`;

  await connection.execute(
    'INSERT INTO admin_users (id, username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
    [id, username, email, hash, 'superadmin']
  );

  console.log(`✓ Admin user "${username}" (${email}) created/updated successfully.`);
  await connection.end();
}

main().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
