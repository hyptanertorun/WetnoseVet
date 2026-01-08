"""
Seed script to create default admin user
Run once to initialize the database with admin credentials
"""
import asyncio
import sys
sys.path.insert(0, '/app/backend')

from db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from services.user_service import UserService
from services.audit_service import AuditService
from models.user import UserRole
from models.audit import AuditAction

# Default admin credentials
DEFAULT_ADMIN_EMAIL = "admin@wetnose.com.tr"
DEFAULT_ADMIN_PASSWORD = "Wetnose2024!"
DEFAULT_ADMIN_NAME = "Admin WETNOSE"

async def seed_admin():
    """Create default admin user if not exists"""
    print("\n" + "="*50)
    print("WETNOSE Admin Seed Script")
    print("="*50 + "\n")
    
    # Connect to MongoDB
    await connect_to_mongo()
    db = get_database()
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": DEFAULT_ADMIN_EMAIL})
    
    if existing_admin:
        print(f"⚠️  Admin user already exists: {DEFAULT_ADMIN_EMAIL}")
        print("   Skipping seed...\n")
    else:
        # Create admin user
        admin = await UserService.create_user(
            email=DEFAULT_ADMIN_EMAIL,
            password=DEFAULT_ADMIN_PASSWORD,
            full_name=DEFAULT_ADMIN_NAME,
            role=UserRole.ADMIN,
            phone="0553 484 54 24",
            created_by=None  # System created
        )
        
        if admin:
            print("✅ Admin user created successfully!")
            print(f"   Email: {DEFAULT_ADMIN_EMAIL}")
            print(f"   Password: {DEFAULT_ADMIN_PASSWORD}")
            print(f"   Role: {admin.role.value}")
            print(f"   ID: {admin.id}\n")
            
            # Log seed action
            await AuditService.log(
                entity_type="user",
                entity_id=admin.id,
                action=AuditAction.CREATE,
                actor_email="system",
                metadata={"source": "seed_script"},
                after_state={
                    "email": admin.email,
                    "full_name": admin.full_name,
                    "role": admin.role.value
                }
            )
        else:
            print("❌ Failed to create admin user")
    
    # Create indexes
    print("Creating database indexes...")
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.refresh_tokens.create_index("token")
    await db.refresh_tokens.create_index("user_id")
    await db.audit_logs.create_index("timestamp")
    await db.audit_logs.create_index("entity_type")
    await db.audit_logs.create_index("actor_user_id")
    await db.settings.create_index("id", unique=True)
    print("✅ Indexes created\n")
    
    # Close connection
    await close_mongo_connection()
    
    print("="*50)
    print("✅ Seed completed!")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(seed_admin())
