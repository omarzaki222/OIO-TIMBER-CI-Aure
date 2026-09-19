"""Development seed. Sample units are fictional placeholders, not real OIO catalog."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.category import Category
from app.db.models.product import Product, ProductImage
from app.db.models.role import ROLE_ADMIN, ROLE_CUSTOMER, Role


def seed_roles(db: Session) -> None:
    for code, name in ((ROLE_CUSTOMER, "Customer"), (ROLE_ADMIN, "Administrator")):
        if db.scalar(select(Role).where(Role.code == code)) is None:
            db.add(Role(code=code, name=name))
    db.commit()


def seed_categories_and_units(db: Session) -> None:
    cats = [
        ("Bedrooms", "bedrooms", "Bedroom furniture collections", 10),
        ("Living Rooms", "living-rooms", "Living room furniture collections", 20),
        ("Dining Rooms", "dining-rooms", "Dining room furniture collections", 30),
        ("Kitchens", "kitchens", "Kitchen furniture collections", 40),
        ("Offices", "offices", "Office furniture collections", 50),
    ]
    for name, slug, desc, order in cats:
        if db.scalar(select(Category).where(Category.slug == slug)) is None:
            db.add(Category(name=name, slug=slug, description=desc, sort_order=order, is_active=True))
    db.commit()

    bedrooms = db.scalar(select(Category).where(Category.slug == "bedrooms"))
    if bedrooms and db.scalar(select(Product).where(Product.slug == "sample-bedroom-suite")) is None:
        product = Product(
            category_id=bedrooms.id,
            name="Sample Bedroom Suite (placeholder)",
            slug="sample-bedroom-suite",
            short_description="Fictional sample unit for local development only.",
            description="Placeholder catalog item. Not a real OIO Wood & Timber product.",
            specifications={"note": "demo"},
            dimensions="W 200cm x D 90cm x H 110cm",
            materials="Oak veneer (placeholder)",
            finish="Natural oil (placeholder)",
            price=None,
            price_on_request=True,
            status="PUBLISHED",
            is_featured=True,
        )
        db.add(product)
        db.flush()
        db.add(
            ProductImage(
                product_id=product.id,
                image_url="https://placehold.co/800x600/f5f0e6/1a1a1a?text=OIO+placeholder",
                alt_text="Placeholder furniture image",
                sort_order=0,
                is_primary=True,
            )
        )
        db.commit()


def run_seed(db: Session) -> None:
    seed_roles(db)
    seed_categories_and_units(db)


if __name__ == "__main__":
    from app.db.session import SessionLocal

    session = SessionLocal()
    try:
        run_seed(session)
        print("Seed complete.")
    finally:
        session.close()
