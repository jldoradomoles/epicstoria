module.exports = {
  apps: [
    {
      name: 'epicstoria-frontend',
      script: 'dist/epicstoria/server/server.mjs',
      cwd: '/var/www/epicstoria',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/www/epicstoria/logs/frontend-error.log',
      out_file: '/var/www/epicstoria/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
    },
    {
      name: 'epicstoria-backend',
      script: 'dist/index.js',
      cwd: '/var/www/epicstoria/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/epicstoria/logs/backend-error.log',
      out_file: '/var/www/epicstoria/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
    },
  ],
};
