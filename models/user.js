const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
   
    isAdmin: {
        type: Boolean,
        required: false,
    },
    street: {
        type: String,
        default: '',
    },
    apartment: {
        type: String,
        default: '',
    },
    zip: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    country: {
        type: Boolean,
        default: '',
    },
})
userSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  userSchema.set("toJSON", {
    virtual: true,
  });
exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
