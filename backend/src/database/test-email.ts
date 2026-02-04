import { EmailService } from '../services/email.service';

/**
 * Script de prueba para verificar la configuración de email
 */
async function testEmailService() {
  console.log('🧪 Probando servicio de email...\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión con servidor de email...');
    const isConnected = await EmailService.verifyConnection();

    if (!isConnected) {
      console.error('❌ No se pudo conectar al servidor de email');
      console.log('\n💡 Verifica tu configuración en .env:');
      console.log('   - EMAIL_HOST');
      console.log('   - EMAIL_PORT');
      console.log('   - EMAIL_USER');
      console.log('   - EMAIL_PASSWORD');
      process.exit(1);
    }

    console.log('✅ Conexión exitosa\n');

    // 2. Pedir email de prueba
    const testEmail = process.argv[2] || process.env.EMAIL_USER;

    if (!testEmail) {
      console.log('⚠️  No se proporcionó un email de prueba');
      console.log('   Uso: npm run test:email tu-email@ejemplo.com');
      process.exit(1);
    }

    console.log(`📧 Enviando emails de prueba a: ${testEmail}\n`);

    // 3. Email de bienvenida
    console.log('2️⃣ Enviando email de bienvenida...');
    await EmailService.sendWelcomeEmail(testEmail, 'Usuario de Prueba');
    console.log('✅ Email de bienvenida enviado\n');

    // 4. Email de reset de contraseña
    console.log('3️⃣ Enviando email de reset de contraseña...');
    await EmailService.sendPasswordResetEmail(
      testEmail,
      'Usuario de Prueba',
      'test-token-123456789',
    );
    console.log('✅ Email de reset enviado\n');

    // 5. Email de confirmación
    console.log('4️⃣ Enviando email de confirmación de cambio...');
    await EmailService.sendPasswordChangedConfirmation(testEmail, 'Usuario de Prueba');
    console.log('✅ Email de confirmación enviado\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📬 Revisa tu bandeja de entrada (y spam) en:', testEmail);
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Ejecutar pruebas
testEmailService();
