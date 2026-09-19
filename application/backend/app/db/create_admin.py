"""Create or update a local ADMIN user. No password is hardcoded.

  cd application/backend
  ADMIN_EMAIL=ops@example.com ADMIN_PASSWORD='your-local-password' PYTHONPATH=. python -m app.db.create_admin
"""

import os
import sys

from sqlalchemy import select

from app.core.security import hash_password
from app.db.models.role import ROLE_ADMIN, Role
from app.db.models.user import User
from app.db.session import SessionLocal


def main() -> None:
    email = (os.environ.get("ADMIN_EMAIL") or "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD") or ""
    if not email or len(password) < 8:
        print("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters).", file=sys.stderr)
        sys.exit(1)
    db = SessionLocal()
    try:
        role = db.scalar(select(Role).where(Role.code == ROLE_ADMIN))
        if role is None:
            print("ADMIN role missing. Run seed first.", file=sys.stderr)
            sys.exit(1)
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            db.add(
                User(
                    role_id=role.id,
                    email=email,
                    password_hash=hash_password(password),
                    first_name="Studio",
                    is_active=True,
                )
            )
            db.commit()
            print(f"Created ADMIN {email}")
        else:
            user.role_id = role.id
            user.password_hash = hash_password(password)
            user.is_active = True
            db.commit()
            print(f"Updated ADMIN {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
