var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    first: String,
    last: String,
    email: {
        type: String,
        unique: true,
        dropDups: true,
        sparse: true
    },

    phoneNumber: {
        type: String,
        unique: true,
        dropDups: true,
        sparse: true
    },

    passwordHash: String,
    first: String,
    last: String,
    email: {
        type: String,
        unique: true,
        dropDups: true,
        sparse: true
    },

    phoneNumber: {
        type: String,
        unique: true,
        dropDups: true,
        sparse: true
    },

    passwordHash: String,
    confirmationCode: String
});

userSchema.virtual('password')
    .get(function() {
        return this._password;
    })
    .set(function(value) {
        this._password = value;
        if (value) {
            this.passwordHash = bcrypt.hashSync(this._password, bcrypt.genSaltSync(8), null);
        }
    });

userSchema.virtual('passwordConfirmation')
    .get(function() {
        return this._passwordConfirmation;
    })
    .set(function(value) {
        this._passwordConfirmation = value;
    });

userSchema.path('passwordHash').validate(function(v) {
    if (this._password &&
        this._password.length < 8) {
        this.invalidate('password', 'must be at least 8 characters');
    }
    if (this._password != this._passwordConfirmation) {
        this.invalidate('passwordConfirmation', 'password and confirmation must match.');
    }
}, null);

userSchema.statics.generatePasswordHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.isPasswordValid = function(password) {
    return password == undefined || bcrypt.compareSync(password, this.passwordHash);
}

var User = mongoose.model('User', userSchema);

module.exports = User;