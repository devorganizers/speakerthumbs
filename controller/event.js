var Event = require('../models/event')

module.exports = function() {
    return {
        list: function(callback) {
            Event.find().exec(callback);
        },
        get: function(id, callback) {
            Event.findById(id).exec(callback);
        },
        new: function(event) {
            var new_event = new Event();
            new_event.name = event.name;
            new_event.startDate = event.startDate;
            new_event.endDate = event.endDate;
            new_event.location = event.location;
            new_event.description = event.description;
            new_event.save(function(err) {
                if (err) {
                    console.log('Saving event error: ' + err);
                }
            });
        }
    }
}
