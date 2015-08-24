var env = process.node_env;

// Default settings go here
var settings = {
  PORT: 3000,

  LOG_LEVEL: 2,

  mongo: {
    url: 'localhost',
    db: 'friendjs',
    port: 27017
  },

  redis: {
    port: 6379,
    host: 'localhost',
    maxAttempts: 5
  },

  twilio: {
    accountSID: '',
    accountAuthToken: '',
    number: ''
  },

  mandrill: {
    apiKey: 'K4NsYN27hNA4P6D03gPhCw',
    confirmationAddress: 'http://localhost:3000/confirm',
    from: {
      email: 'bot@localhost.com',
      name: 'Mr. Robot'
    },
    subject: 'Confirm your email'
  },

  adminAccountsEnabled: true,
  accountApprovalEnabled: true
}

if ( typeof env == 'undefined' ) {
    env = 'dev';
}

if ( env == 'dev' ) {
	settings.fakePins = true;
	settings.fakeSMS = true;
} else if ( env == 'test' ) {
    settings.mongo.db = 'test';
    LOG_LEVEL = 1;
}

// For docker settings
if (process.env.RUNNING_DOCKER === 'true') {
    settings.mongo.url = process.env.DOCKER_MONGO_URL || 'mongodb';
    settings.redis.host = process.env.DOCKER_REDIS_HOST || 'redis';
}

module.exports = settings;
