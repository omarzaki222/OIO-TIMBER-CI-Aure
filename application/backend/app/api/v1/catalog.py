from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.db.models.category import Category
from app.db.models.product import Product
from app.db.session import get_db
from app.schemas.catalog import CategoryOut, ProductOut
from app.schemas.common import Page

router = APIRouter(tags=["Catalog"])


@router.get("/categories", response_model=list[CategoryOut], summary="Active categories")
def list_categories(db: Session = Depends(get_db)):
    return db.scalars(
        select(Category).where(Category.is_active.is_(True)).order_by(Category.sort_order, Category.name)
    ).all()


@router.get("/products", response_model=Page[ProductOut], summary="Published furniture units")
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = None,
    featured: bool | None = None,
):
    q = select(Product).options(selectinload(Product.images)).where(Product.status == "PUBLISHED")
    if category:
        q = q.join(Category).where(Category.slug == category, Category.is_active.is_(True))
    if featured is True:
        q = q.where(Product.is_featured.is_(True))
    total = db.scalar(select(func.count()).select_from(q.subquery())) or 0
    items = db.scalars(
        q.order_by(Product.is_featured.desc(), Product.name).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return Page(items=items, page=page, page_size=page_size, total=total)


@router.get("/products/slug/{slug}", response_model=ProductOut)
def product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product).options(selectinload(Product.images)).where(Product.slug == slug, Product.status == "PUBLISHED")
    )
    if product is None:
        raise AppError(404, "not_found", "Product not found")
    return product


@router.get("/products/{product_id}", response_model=ProductOut)
def product_by_id(product_id: UUID, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.id == product_id, Product.status == "PUBLISHED")
    )
    if product is None:
        raise AppError(404, "not_found", "Product not found")
    return product
