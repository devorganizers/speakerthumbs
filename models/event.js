var mongoose = require('mongoose');

module.exports = mongoose.model('Event', {
    name: String,
    website: String,
    startDate: Date,
    endDate: Date,
    location: String,
    description: String
});
