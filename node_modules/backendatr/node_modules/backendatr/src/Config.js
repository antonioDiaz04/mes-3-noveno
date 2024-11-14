module.exports = {

    port:process.env.PORT || 3000,
    db:{
        url: process.env.DB_MONGO ||'mongodb://localhost/purificadoras'
    },
    SECRET_KEY: 'yourSecretKey'

};