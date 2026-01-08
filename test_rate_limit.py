#!/usr/bin/env python3
"""
Quick test for rate limiting functionality
"""

import asyncio
import aiohttp
import json

BACKEND_URL = "https://petclinic-9.preview.emergentagent.com"

async def test_rate_limit():
    async with aiohttp.ClientSession() as session:
        url = f"{BACKEND_URL}/api/public/contact"
        
        contact_data = {
            "name": "Rate Test User",
            "email": "ratetest@example.com", 
            "phone": "+90 555 999 8888",
            "subject": "Rate Limit Test",
            "message": "Testing rate limiting with shorter intervals between requests."
        }
        
        print("Testing rate limiting with rapid requests...")
        
        for i in range(25):
            try:
                async with session.post(url, json=contact_data) as response:
                    print(f"Request {i+1}: Status {response.status}")
                    
                    if response.status == 429:
                        error_data = await response.json()
                        print(f"✅ Rate limited after {i+1} requests!")
                        print(f"Response: {json.dumps(error_data, indent=2)}")
                        return
                    elif response.status != 200:
                        error_text = await response.text()
                        print(f"❌ Unexpected error: {response.status} - {error_text}")
                        return
                        
                # Small delay to avoid overwhelming
                await asyncio.sleep(0.1)
                
            except Exception as e:
                print(f"❌ Request {i+1} failed: {e}")
                return
        
        print("❌ Rate limiting did not trigger after 25 requests")

if __name__ == "__main__":
    asyncio.run(test_rate_limit())