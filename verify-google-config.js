import dotenv from 'dotenv';
dotenv.config();

console.log('=== VERIFICACIÓN DE CONFIGURACIÓN GOOGLE OAUTH ===');
console.log('');

// Verificar variables de entorno
console.log('✅ Variables de entorno:');
console.log('CLIENT_ID:', process.env.CLIENT_ID ? '✅ Configurado' : '❌ NO configurado');
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET ? '✅ Configurado' : '❌ NO configurado');
console.log('REDIRECT_URI:', process.env.REDIRECT_URI ? '✅ Configurado' : '❌ NO configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ NO configurado');

console.log('');
console.log('📋 Configuración actual:');
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

console.log('');
console.log('🔧 INSTRUCCIONES PARA GOOGLE CLOUD CONSOLE:');
console.log('');
console.log('1. Ve a https://console.cloud.google.com/');
console.log('2. Selecciona tu proyecto (o crea uno nuevo)');
console.log('3. Ve a "APIs y servicios" > "Credenciales"');
console.log('4. Encuentra tu Client ID OAuth 2.0:');
console.log('   -', process.env.CLIENT_ID);
console.log('');
console.log('5. IMPORTANTE: En "URIs de redirección autorizados" debes tener EXACTAMENTE:');
console.log('   -', process.env.REDIRECT_URI);
console.log('');
console.log('6. También añade estas URIs adicionales para desarrollo:');
console.log('   - http://localhost:3002/api/v1/auth/google/callback');
console.log('   - http://127.0.0.1:3002/api/v1/auth/google/callback');
console.log('');
console.log('7. En "Orígenes autorizados de JavaScript" añade:');
console.log('   - http://localhost:3002');
console.log('   - http://127.0.0.1:3002');
console.log('   - http://localhost:5173 (para tu frontend React)');
console.log('');
console.log('8. Asegúrate de que "Google+ API" esté habilitada');
console.log('');
console.log('⚠️  RECUERDA: Después de hacer cambios en Google Cloud Console,');
console.log('   puede tomar hasta 5 minutos en propagarse.');
