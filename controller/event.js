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
            var newEvent = new Event();
            newEvent.name = event.name;
            newEvent.startDate = event.startDate;
            newEvent.endDate = event.endDate;
            newEvent.location = event.location;
            newEvent.description = event.description;
            newEvent.save(function(err) {
                if (err) {
                    console.log('Saving event error: ' + err);
                }
            });
        },
        update: function(event) {
            Event.findById(event.id, function(err, updatedEvent) {
                if (err) {
                    console.log('Retriveing event to update error: ' + err);
                }
                updatedEvent.name = event.name;
                updatedEvent.startDate = event.startDate;
                updatedEvent.endDate = event.endDate;
                updatedEvent.location = event.location;
                updatedEvent.description = event.description;
                updatedEvent.save(function(err) {
                    if (err) {
                        console.log('Updating event error: ' + err);
                    }
                });
            });
        },
        delete: function(id, callback) {
            Event.findByIdAndRemove(id, callback);
        }
    }
}
