// backend/utils/validators.js
module.exports = {
    isEmail: function (v) {
      return typeof v === 'string' && /\S+@\S+\.\S+/.test(v);
    }
  };  