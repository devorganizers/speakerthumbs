var Talk = require('../models/talk');

module.exports = function() {
    return {
        list: function(filters, callback) {
            Talk.find(filters).populate('event owner').exec(callback);
        },
        get: function(id, callback) {
            Talk.findById(id).populate('event owner').exec(callback);
        },
        new: function(talk, userLogged) {
            var newTalk = new Talk();
            newTalk.name = talk.name;
            newTalk.description = talk.description;
            newTalk.event = talk.event;
            newTalk.owner = userLogged;
            newTalk.save(function(err) {
                if (err) {
                    console.log('Saving talk error: ' + err);
                }
            });
        },
        update: function(talk, userLogged) {
            Talk.findById(talk.id, function(err, updatedTalk) {
                if (err) {
                    console.log('Retriveing talk to update error: ' + err);
                }
                if (updatedTalk.owner == userLogged._id.toString()) {
                    updatedTalk.name = talk.name;
                    updatedTalk.description = talk.description;
                    updatedTalk.event = talk.event;
                    updatedTalk.save(function(err) {
                        if (err) {
                            console.log('Updating talk error: ' + err);
                        }
                    });
                } else {
                    console.log('Updating another user\'s talk error.');
                }
            });
        },
        delete: function(id, userLogged, callback) {
            Talk.findById(id).populate('event').exec(function(err, talk) {
                if (err) {
                    callback(err);
                }
                if (talk.owner == userLogged._id.toString() || talk.event.owner == userLogged._id.toString()) {
                    talk.remove(function(err) {
                        callback(err, talk.event._id.toString());
                    });
                } else {
                    callback({message: 'Deleting another user\'s talk error.'});
                }
            });
        }
    };
};
