import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Return HTML admin interface
  const adminHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>School Enrollment System - Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .status-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-indicator { display: flex; align-items: center; margin-bottom: 15px; }
        .indicator { width: 12px; height: 12px; border-radius: 50%; margin-right: 10px; }
        .connected { background: #10b981; }
        .error { background: #ef4444; }
        .unknown { background: #6b7280; }
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; }
        .stat { text-align: center; padding: 10px; background: #f9fafb; border-radius: 4px; }
        .refresh-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .refresh-btn:hover { background: #2563eb; }
        .error-message { color: #ef4444; font-size: 12px; margin-top: 5px; }
        .loading { opacity: 0.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏫 School Enrollment System - Admin Dashboard</h1>
            <p>Monitor system health and connection status</p>
            <button class="refresh-btn" onclick="refreshDashboard()">🔄 Refresh Status</button>
        </div>

        <div id="dashboard" class="status-grid">
            <div class="status-card">
                <h3>📊 System Status</h3>
                <div id="system-status" class="status-indicator">
                    <div class="indicator unknown"></div>
                    <span>Loading...</span>
                </div>
                <div id="system-info"></div>
            </div>

            <div class="status-card">
                <h3>🗄️ Database Connection</h3>
                <div id="database-status" class="status-indicator">
                    <div class="indicator unknown"></div>
                    <span>Testing connection...</span>
                </div>
                <div id="database-stats" class="stats"></div>
                <div id="database-error" class="error-message"></div>
            </div>

            <div class="status-card">
                <h3>📁 Blob Storage Connection</h3>
                <div id="blob-status" class="status-indicator">
                    <div class="indicator unknown"></div>
                    <span>Testing connection...</span>
                </div>
                <div id="blob-stats" class="stats"></div>
                <div id="blob-error" class="error-message"></div>
            </div>
        </div>

        <div class="status-card">
            <h3>🔗 API Endpoints</h3>
            <div id="endpoints-list"></div>
        </div>
    </div>

    <script>
        async function refreshDashboard() {
            const dashboard = document.getElementById('dashboard');
            dashboard.classList.add('loading');

            try {
                const response = await fetch('/api/admin/dashboard');
                const data = await response.json();

                // Update system status
                updateSystemStatus(data.system);
                
                // Update database status
                updateDatabaseStatus(data.database);
                
                // Update blob storage status
                updateBlobStatus(data.blobStorage);
                
                // Update endpoints
                updateEndpoints(data);

            } catch (error) {
                console.error('Failed to refresh dashboard:', error);
                alert('Failed to refresh dashboard. Check console for details.');
            } finally {
                dashboard.classList.remove('loading');
            }
        }

        function updateSystemStatus(system) {
            const statusEl = document.getElementById('system-status');
            const infoEl = document.getElementById('system-info');
            
            const indicator = statusEl.querySelector('.indicator');
            const text = statusEl.querySelector('span');
            
            indicator.className = 'indicator ' + (system.status === 'fully_operational' ? 'connected' : 
                                                 system.status === 'partially_operational' ? 'unknown' : 'error');
            text.textContent = system.status.replace('_', ' ').toUpperCase();
            
            infoEl.innerHTML = \`
                <small>Environment: \${system.environment}</small><br>
                <small>Region: \${system.vercel?.region || 'unknown'}</small>
            \`;
        }

        function updateDatabaseStatus(database) {
            const statusEl = document.getElementById('database-status');
            const statsEl = document.getElementById('database-stats');
            const errorEl = document.getElementById('database-error');
            
            const indicator = statusEl.querySelector('.indicator');
            const text = statusEl.querySelector('span');
            
            indicator.className = 'indicator ' + (database.status === 'connected' ? 'connected' : 'error');
            text.textContent = database.status === 'connected' ? 'Connected' : 'Connection Failed';
            
            if (database.status === 'connected') {
                statsEl.innerHTML = \`
                    <div class="stat"><strong>\${database.statistics.totalUsers}</strong><br>Total Users</div>
                    <div class="stat"><strong>\${database.statistics.totalStudents}</strong><br>Students</div>
                    <div class="stat"><strong>\${database.statistics.totalEnrollments}</strong><br>Enrollments</div>
                    <div class="stat"><strong>\${database.statistics.totalSections}</strong><br>Sections</div>
                \`;
                errorEl.textContent = '';
            } else {
                statsEl.innerHTML = '';
                errorEl.textContent = database.lastError || 'Unknown error';
            }
        }

        function updateBlobStatus(blob) {
            const statusEl = document.getElementById('blob-status');
            const statsEl = document.getElementById('blob-stats');
            const errorEl = document.getElementById('blob-error');
            
            const indicator = statusEl.querySelector('.indicator');
            const text = statusEl.querySelector('span');
            
            indicator.className = 'indicator ' + (blob.status === 'connected' ? 'connected' : 'error');
            text.textContent = blob.status === 'connected' ? 'Connected' : 'Connection Failed';
            
            if (blob.status === 'connected') {
                statsEl.innerHTML = \`
                    <div class="stat"><strong>\${blob.statistics.totalFiles}</strong><br>Total Files</div>
                    <div class="stat"><strong>\${blob.statistics.storageUsed}</strong><br>Storage Used</div>
                \`;
                errorEl.textContent = '';
            } else {
                statsEl.innerHTML = '';
                errorEl.textContent = blob.lastError || 'Unknown error';
            }
        }

        function updateEndpoints(data) {
            const endpointsEl = document.getElementById('endpoints-list');
            const endpoints = [
                { name: 'Main API', url: '/api/' },
                { name: 'Students', url: '/api/students' },
                { name: 'Enrollments', url: '/api/enrollments' },
                { name: 'File Upload', url: '/api/upload' },
                { name: 'Database Test', url: '/api/db/init' },
                { name: 'Admin Dashboard', url: '/api/admin/dashboard' },
                { name: 'Admin Settings', url: '/api/admin/settings' }
            ];
            
            endpointsEl.innerHTML = endpoints.map(endpoint => 
                \`<div style="margin: 5px 0;"><a href="\${endpoint.url}" target="_blank">\${endpoint.name}</a> - <code>\${endpoint.url}</code></div>\`
            ).join('');
        }

        // Load dashboard on page load
        refreshDashboard();
        
        // Auto-refresh every 30 seconds
        setInterval(refreshDashboard, 30000);
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(adminHTML);
}
