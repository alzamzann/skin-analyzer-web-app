"""create catalog tables

Revision ID: 20260611_01
Revises:
Create Date: 2026-06-11
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260611_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "main_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "ingredients",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_order", sa.Integer(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("ingredient_type", sa.Text()),
        sa.Column("alternate_name", sa.Text()),
        sa.Column("inci_name", sa.Text()),
        sa.Column("important_chemical_component", sa.Text()),
        sa.Column("best_for", sa.Text()),
        sa.Column("can_used_to", sa.Text()),
        sa.Column("not_recommend", sa.Text()),
        sa.Column("personal_care_category", sa.Text()),
        sa.Column("topical_use", sa.Text()),
    )
    op.create_index("ix_ingredients_name", "ingredients", ["name"])
    op.create_index("ix_ingredients_source_order", "ingredients", ["source_order"])
    op.create_table(
        "sub_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("main_category_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["main_category_id"],
            ["main_categories.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "main_category_id",
            "name",
            name="uq_subcategory_main_name",
        ),
    )
    op.create_index("ix_sub_categories_name", "sub_categories", ["name"])
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_order", sa.Integer(), nullable=False),
        sa.Column("public_id", sa.String(length=255), nullable=False),
        sa.Column("bpom_id", sa.String(length=255)),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("brand", sa.Text(), nullable=False),
        sa.Column("sub_category_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("ingredients", sa.Text(), nullable=False),
        sa.Column("image_url", sa.Text()),
        sa.Column("product_url", sa.Text()),
        sa.Column("incidecoder_verif", sa.Text()),
        sa.ForeignKeyConstraint(
            ["sub_category_id"],
            ["sub_categories.id"],
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_products_bpom_id", "products", ["bpom_id"])
    op.create_index("ix_products_brand", "products", ["brand"])
    op.create_index("ix_products_name", "products", ["name"])
    op.create_index("ix_products_source_order", "products", ["source_order"])
    op.create_index(
        "ix_products_sub_category_id",
        "products",
        ["sub_category_id"],
    )


def downgrade() -> None:
    op.drop_table("products")
    op.drop_table("sub_categories")
    op.drop_table("ingredients")
    op.drop_table("main_categories")
