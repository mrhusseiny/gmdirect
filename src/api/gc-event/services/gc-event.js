'use strict';

/**
 * gc-event service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::gc-event.gc-event');
