// Script pour vérifier que tous les endpoints sont accessibles
// Exécuter avec: npx ts-node src/scripts/check-api.ts

const API_URL = 'http://localhost:3000/api/v1';

async function checkEndpoint(method: string, url: string, token?: string) {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers,
    });

    console.log(`${method} ${url}: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.log(`${method} ${url}: ERROR - ${error.message}`);
    return false;
  }
}

async function checkAllEndpoints() {
  console.log("🔍 Vérification de l'API...\n");

  // Public endpoints
  console.log('📢 Public Endpoints:');
  await checkEndpoint('POST', '/auth/register');
  await checkEndpoint('POST', '/auth/login');
  console.log('');

  // Essayer de se connecter pour obtenir un token
  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@medagenda.com',
        password: 'Admin123!',
      }),
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      const token = data.token;

      console.log('✅ Connexion réussie - Token obtenu\n');

      // Protected endpoints
      console.log('🔒 Protected Endpoints (with token):');

      // Auth
      await checkEndpoint('GET', '/auth/me', token);

      // Users
      await checkEndpoint('GET', '/users', token);

      // Patients
      await checkEndpoint('GET', '/patients', token);

      // Practitioners
      await checkEndpoint('GET', '/practitioners', token);

      // Appointments
      await checkEndpoint('GET', '/appointments', token);

      // Invoices
      await checkEndpoint('GET', '/invoices', token);
      await checkEndpoint('GET', '/invoices/dashboard', token);
      await checkEndpoint('GET', '/invoices/unpaid', token);

      // Queue
      await checkEndpoint('GET', '/queue', token);
      await checkEndpoint('GET', '/queue/stats', token);
      await checkEndpoint('GET', '/queue/settings', token);

      // Resources
      await checkEndpoint('GET', '/resources', token);

      // Settings
      await checkEndpoint('GET', '/settings', token);

      // Activity Logs
      await checkEndpoint('GET', '/activity-logs', token);

      // Departments
      await checkEndpoint('GET', '/departments', token);

      // Currencies
      await checkEndpoint('GET', '/currencies', token);
      await checkEndpoint('GET', '/currencies/default', token);

      // Notifications
      await checkEndpoint('GET', '/notifications/logs', token);
      await checkEndpoint('GET', '/notifications/logs/unread/count', token);

      // Permissions
      await checkEndpoint('GET', '/permissions', token);

      console.log('\n✅ Vérification terminée!');
    } else {
      console.log('❌ Impossible de se connecter avec admin@medagenda.com');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion au serveur:', error.message);
  }
}

checkAllEndpoints();
