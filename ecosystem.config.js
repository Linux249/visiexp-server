module.exports = {
    apps: [{
        name: 'API(Node)',
        script: 'dist/index.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
        },
        env_production: {
            NODE_ENV: 'production',
        },
        watch: true,
        time: true, // add timestamp
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        combine_logs: true, // one file for all cluster
    }, /* {
        name: 'API(python)',
        script: 'server.py',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
        watch: true,
    } */],

    deploy: {
        production: {
            user: 'node',
            host: '212.83.163.1',
            ref: 'origin/master',
            repo: 'git@github.com:repo.git',
            path: '/var/www/production',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
        },
    },
};
