const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'softcodes-vs-code',
  location: 'europe-west1'
};
exports.connectorConfig = connectorConfig;

