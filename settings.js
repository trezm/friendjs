var env = process.node_env;

// Default settings go here
var settings = {
    MONGO_URL: 'localhost',	
    MONGO_DB: 'dev',
    
    PORT: 3000,

    LOG_LEVEL: 2,
}

if ( typeof env == 'undefined' ) {
    env = 'dev';
}

if ( env == 'dev' ) {

} else if ( env == 'test' ) {
    settings.MONGO_DB = 'test';
    LOG_LEVEL = 1;
}

//console.log( "Using env:", env );

module.exports = settings;
