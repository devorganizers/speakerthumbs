var Talk = require('../models/talk');

module.exports = function() {
    return {
        list: function(callback) {
            Talk.find().exec(callback);
        },
        get: function(id, callback) {
            Talk.findById(id).populate('event').exec(callback);
        }
    }
}
