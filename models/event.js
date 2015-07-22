var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Event', {
    name: String,
    website: String,
    startDate: Date,
    endDate: Date,
    location: String,
    description: String,
    isTalkOpen: {type: Boolean, default: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User'}
});
