// Script para generar hash bcrypt de contraseña
const bcrypt = require('bcrypt');

const password = 'Yudis1975';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generando hash:', err);
    return;
  }
  
  console.log('Password:', password);
  console.log('Hash bcrypt:', hash);
  console.log('\nSQL para actualizar:');
  console.log(`UPDATE usuarios SET password_hash = '${hash}' WHERE email = '1975.orozcoyudis@gmail.com';`);
});
