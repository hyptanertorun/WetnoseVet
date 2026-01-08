#!/usr/bin/env python3
"""
Test to check IP address detection for rate limiting
"""

import asyncio
import aiohttp
import json

BACKEND_URL = "https://petclinic-9.preview.emergentagent.com"

async def test_ip_detection():
    async with aiohttp.ClientSession() as session:
        # First, let's check what IP the server sees
        url = f"{BACKEND_URL}/api/public/maintenance-status"
        
        print("Testing IP detection...")
        
        # Make a few requests to see if they come from the same IP
        for i in range(5):
            try:
                async with session.get(url) as response:
                    print(f"Request {i+1}: Status {response.status}")
                    
                await asyncio.sleep(0.1)
                
            except Exception as e:
                print(f"❌ Request {i+1} failed: {e}")
                return

if __name__ == "__main__":
    asyncio.run(test_ip_detection())