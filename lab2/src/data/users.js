const fs = require('fs');

let users = [];
const filePath = './src/data/users.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  users = JSON.parse(data);
} catch (error) {
  users = [];
}

const saveUsers = () => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
        throw error;
    }
};

module.exports = { users, saveUsers };