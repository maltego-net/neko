// server/utils/excel.js
const Excel = require('exceljs');
const fs    = require('fs');
const path  = require('path');

const FILE_PATH = path.join(__dirname, '..', 'users.xlsx');

async function saveUserToExcel(user) {
  const workbook = new Excel.Workbook();
  let sheet;

  // 1) Если файл есть — читаем, иначе создаём новую книгу и шапку
  if (fs.existsSync(FILE_PATH)) {
    await workbook.xlsx.readFile(FILE_PATH);
    sheet = workbook.getWorksheet('Users');
  } else {
    sheet = workbook.addWorksheet('Users');
    // создаём шапку вручную
    sheet.addRow([
      'Twitter ID',
      'Username',
      'Display Name',
      'Logged At',
      'Wallet'
    ]);
  }

  // 2) Добавляем новую строку как массив (чётко по столбцам)
  sheet.addRow([
    user.twitterId,
    user.username,
    user.displayName,
    new Date().toLocaleString(),
    user.wallet || ''
  ]);

  // 3) Сохраняем книгу
  await workbook.xlsx.writeFile(FILE_PATH);
}

module.exports = { saveUserToExcel };
