var Event = require('../models/event');
var Talk = require('../models/talk');

module.exports = function() {
    return {
        list: function(callback) {
            Event.find().exec(callback);
        },
        get: function(id, callback) {
            Event.findById(id).exec(callback);
        },
        new: function(event, userLogged) {
            var newEvent = new Event();
            newEvent.name = event.name;
            newEvent.website = event.website;
            newEvent.startDate = event.startDate;
            newEvent.endDate = event.endDate;
            newEvent.location = event.location;
            newEvent.description = event.description;
            newEvent.owner = userLogged;
            newEvent.save(function(err) {
                if (err) {
                    console.log('Saving event error: ' + err);
                }
            });
        },
        update: function(event, userLogged) {
            Event.findById(event.id, function(err, updatedEvent) {
                if (err) {
                    console.log('Retriveing event to update error: ' + err);
                }
                if (updatedEvent.owner == userLogged._id.toString()) {
                    updatedEvent.name = event.name;
                    updatedEvent.website = event.website;
                    updatedEvent.startDate = event.startDate;
                    updatedEvent.endDate = event.endDate;
                    updatedEvent.location = event.location;
                    updatedEvent.description = event.description;
                    updatedEvent.save(function(err) {
                        if (err) {
                            console.log('Updating event error: ' + err);
                        }
                    });
                } else {
                    console.log('Updating another user\'s event error.');
                }
            });
        },
        delete: function(id, userLogged, callback) {
            Event.findById(id, function(err, event) {
                if (event.owner == userLogged._id.toString()) {
                    // I do not know if this error handling is necessary, I did not test it, but I think it works
                    if (err) {
                        callback(err);
                        return;
                    } else {
                        var error;
                        Talk.remove({event: id}, function(err) {
                            if (error) {
                                return;
                            }
                            if (err){
                                error = err;
                                return;
                            }
                        });
                        event.remove(function(err) {
                            if (error) {
                                return;
                            }
                            if (err) {
                                error = err;
                                return;
                            }
                        });
                        callback(error);
                    }
                } else {
                    callback({message: 'Deleting another user\'s event error.'});
                }
            });
        }
    }
}
