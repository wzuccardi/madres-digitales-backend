// Script para generar hash bcrypt de contraseña
const bcrypt = require('bcrypt');

const password = 'nayivis03';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generando hash:', err);
    return;
  }
  
  console.log('Password:', password);
  console.log('Hash bcrypt:', hash);
  console.log('\nSQL para actualizar:');
  console.log(`UPDATE usuarios SET password_hash = '${hash}' WHERE email = 'nayiviscastrotorres@gmail.com';`);
});
