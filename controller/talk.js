var Talk = require('../models/talk');

module.exports = function() {
    return {
        list: function(callback) {
            Talk.find().exec(callback);
        },
        get: function(id, callback) {
            Talk.findById(id).populate('event').exec(callback);
        },
        new: function(talk) {
            var newTalk = new Talk();
            newTalk.name = talk.name;
            newTalk.description = talk.description;
            newTalk.event = talk.event;
            newTalk.save(function(err) {
                if (err) {
                    console.log('Saving talk error: ' + err);
                }
            });
        },
        update: function(talk) {
            Talk.findById(talk.id, function(err, updatedTalk) {
                if (err) {
                    console.log('Retriveing talk to update error: ' + err);
                }
                updatedTalk.name = talk.name;
                updatedTalk.description = talk.description;
                updatedTalk.event = talk.event;
                updatedTalk.save(function(err) {
                    if (err) {
                        console.log('Updating talk error: ' + err);
                    }
                });
            });
        },
        delete: function(id, callback) {
            Talk.findByIdAndRemove(id, callback);
        }
    }
}
