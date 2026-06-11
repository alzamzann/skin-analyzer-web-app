from sqlalchemy import ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class MainCategory(Base):
    __tablename__ = "main_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)

    sub_categories: Mapped[list["SubCategory"]] = relationship(
        back_populates="main_category",
        cascade="all, delete-orphan",
    )


class SubCategory(Base):
    __tablename__ = "sub_categories"
    __table_args__ = (
        UniqueConstraint("main_category_id", "name", name="uq_subcategory_main_name"),
        Index("ix_sub_categories_name", "name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    main_category_id: Mapped[int] = mapped_column(
        ForeignKey("main_categories.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)

    main_category: Mapped[MainCategory] = relationship(back_populates="sub_categories")
    products: Mapped[list["Product"]] = relationship(back_populates="sub_category")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index("ix_products_source_order", "source_order"),
        Index("ix_products_bpom_id", "bpom_id"),
        Index("ix_products_name", "name"),
        Index("ix_products_brand", "brand"),
        Index("ix_products_sub_category_id", "sub_category_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_order: Mapped[int] = mapped_column(Integer, nullable=False)
    public_id: Mapped[str] = mapped_column(String(255), nullable=False)
    bpom_id: Mapped[str | None] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    brand: Mapped[str] = mapped_column(Text, nullable=False)
    sub_category_id: Mapped[int] = mapped_column(
        ForeignKey("sub_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ingredients: Mapped[str] = mapped_column(Text, nullable=False, default="")
    image_url: Mapped[str | None] = mapped_column(Text)
    product_url: Mapped[str | None] = mapped_column(Text)
    incidecoder_verif: Mapped[str | None] = mapped_column(Text)

    sub_category: Mapped[SubCategory] = relationship(back_populates="products")


class Ingredient(Base):
    __tablename__ = "ingredients"
    __table_args__ = (
        Index("ix_ingredients_source_order", "source_order"),
        Index("ix_ingredients_name", "name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_order: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    ingredient_type: Mapped[str | None] = mapped_column(Text)
    alternate_name: Mapped[str | None] = mapped_column(Text)
    inci_name: Mapped[str | None] = mapped_column(Text)
    important_chemical_component: Mapped[str | None] = mapped_column(Text)
    best_for: Mapped[str | None] = mapped_column(Text)
    can_used_to: Mapped[str | None] = mapped_column(Text)
    not_recommend: Mapped[str | None] = mapped_column(Text)
    personal_care_category: Mapped[str | None] = mapped_column(Text)
    topical_use: Mapped[str | None] = mapped_column(Text)
