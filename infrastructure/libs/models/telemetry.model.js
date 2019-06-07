const dynamoose = require('dynamoose');

const DEFAULTS = {
    tableName: process.env.TELEMETRY_TABLE,
    region: process.env.REGION,
    schemaOptions: {
        create: false,
        update: false,
        waitForActive: false,
        saveUnknown: true
    }
};

dynamoose.AWS.config.update({
    region: DEFAULTS.region
})

const TelemetrySchema = new dynamoose.Schema({
    telemetryId: {
        type: String,
        hashKey: true
    },
    missionId: {
        type: String,
        rangeKey: true,
        index: {
            global: true,
            name: 'MissionIndex',
            project: true,
            hashKey: 'missionId'
        }
    },
    distance: Number,
    longitude: Number,
    latitude: Number,
    humidity: Number,
    pressure: Number,
    temperature: Number,
    last_command: Object,
    timestamp: Date
});

let TelemetryModel = dynamoose.model(DEFAULTS.tableName, TelemetrySchema, DEFAULTS.schemaOptions);

module.exports = TelemetryModel;
