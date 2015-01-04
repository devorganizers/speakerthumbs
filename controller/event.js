var Event = require('../models/event')

module.exports = function() {
    return {
        list: function(callback) {
            Event.find().exec(callback);
        },
        get: function(id, callback) {
            Event.findById(id).exec(callback);
        }
    }
}
