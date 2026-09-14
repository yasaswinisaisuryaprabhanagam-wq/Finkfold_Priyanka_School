const { createClient } = require('@supabase/supabase-js');
const url = 'https://eddndkxhnoxywcaxccnv.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-secret-key';
const clientAnon = createClient(url, anonKey);
const clientSecret = createClient(url, secretKey);

async function test() {
  try {
    console.log('--- Testing Anon Client ---');
    const { data: aSchools, error: ae1 } = await clientAnon.from('schools').select('*');
    console.log('Anon Schools:', aSchools, 'Error:', ae1 ? ae1.message : null);

    console.log('--- Testing Secret Client ---');
    const { data: sSchools, error: se1 } = await clientSecret.from('schools').select('*');
    console.log('Secret Schools:', sSchools, 'Error:', se1 ? se1.message : null);

    // Test raw auth users
    const { data: users, error: ue } = await clientSecret.auth.admin.listUsers();
    console.log('Auth users count:', users && users.users ? users.users.length : null, 'Error:', ue ? ue.message : null);
    if (users && users.users) {
      users.users.forEach(u => console.log('User:', u.email, u.id));
    }
  } catch (err) {
    console.error('Catch error:', err);
  }
}

test();
