require('dotenv').config();

module.exports = {
  categoryId: process.env.TICKET_CATEGORY_ID || '',
  staffRoleId: process.env.TICKET_STAFF_ROLE_ID || '',
  prefix: process.env.TICKET_PREFIX || '!ticket',
};
