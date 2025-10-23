// Simple test script to verify the admin API endpoint
// Run this with: node test-admin-api.js

const API_BASE = "http://localhost:4000";

async function testAdminAPI() {
    console.log("Testing admin API endpoint...");
    
    // First, let's test if the server is running
    try {
        const healthCheck = await fetch(`${API_BASE}/api/experiments`);
        console.log("Server is running, status:", healthCheck.status);
    } catch (e) {
        console.error("Server is not running or not accessible:", e.message);
        return;
    }
    
    // Test the pending endpoint without auth (should fail)
    try {
        const res = await fetch(`${API_BASE}/api/experiments/pending`);
        console.log("Pending endpoint without auth - Status:", res.status);
        const data = await res.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error testing pending endpoint:", e.message);
    }
}

testAdminAPI();
