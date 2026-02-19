module.exports = {
  apps: [
    {
      name: 'apiaberta-fuel',
      script: 'src/index.js',
      cwd: '/root/apiaberta/connector-fuel',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGO_URI: 'mongodb://localhost:27017/apiaberta-fuel'
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    }
  ]
}
