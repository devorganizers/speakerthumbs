var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Talk', {
    name: String,
    description: String,
    event: {type: Schema.Types.ObjectId, ref: 'Event'}
});
