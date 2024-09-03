import { insertEmailConfirmation } from '../dao/mongodb-dao.mjs';

insertEmailConfirmation("to_email@gmail.com", "from_email@gmail.com", "Test", "manual");