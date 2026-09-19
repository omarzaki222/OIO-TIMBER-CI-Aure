from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CategoryOut(ORMModel):
    id: UUID
    name: str
    slug: str
    description: str | None
    is_active: bool = True
    sort_order: int


class CategoryAdminIn(BaseModel):
    name: str
    slug: str
    description: str | None = None
    is_active: bool = True
    sort_order: int = 0


class ProductImageOut(ORMModel):
    id: UUID
    image_url: str
    alt_text: str | None
    sort_order: int
    is_primary: bool


class ProductOut(ORMModel):
    id: UUID
    category_id: UUID
    name: str
    slug: str
    short_description: str | None
    description: str | None
    specifications: dict
    dimensions: str | None
    materials: str | None
    finish: str | None
    price: Decimal | None
    price_on_request: bool
    status: str
    is_featured: bool
    images: list[ProductImageOut] = []


class ProductAdminIn(BaseModel):
    category_id: UUID
    name: str
    slug: str
    short_description: str | None = None
    description: str | None = None
    specifications: dict = Field(default_factory=dict)
    dimensions: str | None = None
    materials: str | None = None
    finish: str | None = None
    price: Decimal | None = None
    price_on_request: bool = True
    status: str = "DRAFT"
    is_featured: bool = False


class ProductAdminPatch(BaseModel):
    category_id: UUID | None = None
    name: str | None = None
    slug: str | None = None
    short_description: str | None = None
    description: str | None = None
    specifications: dict | None = None
    dimensions: str | None = None
    materials: str | None = None
    finish: str | None = None
    price: Decimal | None = None
    price_on_request: bool | None = None
    status: str | None = None
    is_featured: bool | None = None


class ProductImageIn(BaseModel):
    image_url: str
    alt_text: str | None = None
    sort_order: int = 0
    is_primary: bool = False
