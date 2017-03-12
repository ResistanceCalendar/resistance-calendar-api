var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	facebookLink: { type: String },
	date: {type: Date, required: true },
	//coordinates: longitude, latituate
	location: {
		type: { type: String, coordinates: [Number]}
	}
});

EventSchema.index({ 'location' : '2dsphere' });

module.exports = mongoose.model('Event', EventSchema);