const http = require('http');

const routes = [
  { path: '/', expected: ['Priyanka EM School', 'School Portal', 'Student Portal', 'Apply for Admissions'] },
  { path: '/login', expected: ['Portal Email', 'kiran@priyanka.em', 'Student', 'Faculty', 'Admin', 'Forgot password?'] },
  { path: '/reset-password', expected: ['Reset Portal Password', 'Send Reset Link', 'Registered Email'] },
  { path: '/dashboard?view=faculty', expected: ['Faculty Portal', 'Faculty Workspace', 'Mark Roll Call'] },
  { path: '/dashboard?view=student', expected: ['Student Academic', 'Yasaswini', 'Overall Attendance Rate', 'Daily Timetable', 'Reset Password'] },
  { path: '/dashboard?view=admin', expected: ['Executive Administration Console', 'Class Monitor', 'WhatsApp Gateway Logs', 'Parent Messages'] },
  { path: '/dashboard/attendance/c10a-default-uuid', expected: ['Roll Call for', 'Yasaswini', 'Kiran', 'Kethan', 'Save Attendance Session'] },
  { path: '/about', expected: ['About', 'Priyanka'] },
  { path: '/admissions', expected: ['Admissions'] },
  { path: '/academics', expected: ['Academics'] },
  { path: '/contact', expected: ['Contact'] },
];

function checkRoute(route) {
  return new Promise((resolve) => {
    const url = `http://localhost:3005${route.path}`;
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const found = route.expected.filter(term => data.includes(term));
        const missing = route.expected.filter(term => !data.includes(term));
        resolve({
          path: route.path,
          status: res.statusCode,
          success: res.statusCode === 200 && missing.length === 0,
          found,
          missing,
          length: data.length
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: route.path,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
  });
}

async function runAll() {
  console.log('--- Verifying All UI Routes on http://localhost:3005 ---');
  let passCount = 0;
  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.success) {
      passCount++;
      console.log(`[${res.status}] ${r.path} -> PASS ✅ (${res.length} bytes)`);
    } else {
      console.log(`[${res.status}] ${r.path} -> FAIL ❌`);
      if (res.missing && res.missing.length > 0) {
        console.log('  Missing keywords:', res.missing);
      }
      if (res.error) {
        console.log('  Error:', res.error);
      }
    }
  }
  console.log(`\nResults: ${passCount} / ${routes.length} routes PASSED!`);
}

runAll();
