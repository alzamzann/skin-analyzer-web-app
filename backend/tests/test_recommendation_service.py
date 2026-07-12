from app.repositories.catalog_repository import CatalogRepository
from app.services.recommendation_service import RecommendationService


def test_seed_recommendations_work_when_csvs_are_missing(tmp_path) -> None:
    repository = CatalogRepository(tmp_path)
    repository.load()
    service = RecommendationService(repository)

    ingredients = service.recommend_ingredients("DSPT")
    products, total_candidates = service.recommend_products("DSPT")

    assert total_candidates == 3
    assert [category for category in service.get_available_filters()] == [
        "All",
        "Face Wash",
        "Face Gel",
        "Sunscreen",
    ]
    assert any(ingredient.name == "Ceramides" for ingredient in ingredients)
    assert products[0].similarity_score >= products[-1].similarity_score


def test_csv_loader_cleans_real_dataset_shape(tmp_path) -> None:
    (tmp_path / "ingredients.csv").write_text(
        "\n".join(
            [
                "name,ingredient_type,alternate_name,inci_name,important_chemical_component,best_for,can_used_to,not_recommend,personal_care_category,topical_use,Unnamed: 10",
                "Ceramides,lipid,,Ceramide NP; Ceramide AP,,DRNT,barrier,none,moisturizing,barrier support,",
            ]
        ),
        encoding="utf-8",
    )
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Ceramide Cream,Brand,Sunscreen,Desc,\"45.650,00\",\"Water, Ceramide NP\",,,",
            ]
        ),
        encoding="utf-8",
    )
    repository = CatalogRepository(tmp_path)
    repository.load()

    assert len(repository.ingredients) == 1
    assert repository.ingredients[0].important_chemical_component is None
    assert len(repository.products) == 1
    assert repository.products[0].category == "Sunscreen"
    assert repository.products[0].price == 45650


def test_available_filters_are_grouped_into_main_and_subcategories(tmp_path) -> None:
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Wash,Brand,Face Wash,Desc,10000,Water,,,",
                "NA2,Booster,Brand,Booster,Desc,10000,Water,,,",
                "NA3,Mask,Brand,Sheet Mask,Desc,10000,Water,,,",
            ]
        ),
        encoding="utf-8",
    )
    repository = CatalogRepository(tmp_path)
    repository.load()
    service = RecommendationService(repository)

    assert [
        (category.main_category, category.sub_categories)
        for category in service.get_product_category_filters()
    ] == [
        ("Treatment", ["Booster"]),
        ("Cleanser", ["Face Wash"]),
        ("Other", ["Sheet Mask"]),
    ]
    assert service.get_available_filters() == ["All", "Booster", "Face Wash", "Sheet Mask"]


def test_recommendations_filter_by_main_and_subcategory(tmp_path) -> None:
    (tmp_path / "ingredients.csv").write_text(
        "\n".join(
            [
                "name,ingredient_type,alternate_name,inci_name,important_chemical_component,best_for,can_used_to,not_recommend,personal_care_category,topical_use",
                "Glycerin,humectant,,Glycerin,,ALL,hydration,none,moisturizing,hydration support",
            ]
        ),
        encoding="utf-8",
    )
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Wash,Brand,Face Wash,Desc,10000,Glycerin,,,",
                "NA2,Oil Cleanser,Brand,Cleansing Oil,Desc,10000,Glycerin,,,",
                "NA3,Serum,Brand,Face Serum,Desc,10000,Glycerin,,,",
            ]
        ),
        encoding="utf-8",
    )
    service = RecommendationService(CatalogRepository(tmp_path))

    products, candidates = service.recommend_products("DRNT", main_category="Cleanser")
    assert candidates == 2
    assert {product.sub_category for product in products} == {
        "Face Wash",
        "Cleansing Oil",
    }
    assert {product.main_category for product in products} == {"Cleanser"}

    products, candidates = service.recommend_products(
        "DRNT",
        main_category="Cleanser",
        sub_category="Face Wash",
    )
    assert candidates == 1
    assert products[0].sub_category == "Face Wash"


def test_routine_recommendations_select_top_product_per_main_category(tmp_path) -> None:
    (tmp_path / "ingredients.csv").write_text(
        "\n".join(
            [
                "name,ingredient_type,alternate_name,inci_name,important_chemical_component,best_for,can_used_to,not_recommend,personal_care_category,topical_use",
                "Glycerin,humectant,,Glycerin,,ALL,hydration,none,moisturizing,hydration support",
                "Niacinamide,functional,,Niacinamide,,DRNT,tone,none,brightening,tone support",
            ]
        ),
        encoding="utf-8",
    )
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Wash,Brand,Face Wash,Desc,10000,Glycerin,,,",
                "NA2,Serum Low,Brand,Face Serum,Desc,10000,Glycerin,,,",
                "NA3,Serum Best,Brand,Face Serum,Desc,10000,\"Glycerin, Niacinamide\",,,",
                "NA4,Cream,Brand,Face Cream And Lotion,Desc,10000,Glycerin,,,",
                "NA5,SPF,Brand,Sunscreen,Desc,10000,Glycerin,,,",
            ]
        ),
        encoding="utf-8",
    )
    service = RecommendationService(CatalogRepository(tmp_path))

    products = service.recommend_routine_products("DRNT")

    assert [product.main_category for product in products] == [
        "Cleanser",
        "Treatment",
        "Moisturizer",
        "Sunscreen",
    ]
    assert products[1].name == "Serum Best"


def test_recommendations_reject_mismatched_main_and_subcategory(tmp_path) -> None:
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Wash,Brand,Face Wash,Desc,10000,Water,,,",
                "NA2,Serum,Brand,Face Serum,Desc,10000,Water,,,",
            ]
        ),
        encoding="utf-8",
    )
    service = RecommendationService(CatalogRepository(tmp_path))

    try:
        service.recommend_products(
            "DRNT",
            main_category="Treatment",
            sub_category="Face Wash",
        )
    except ValueError as error:
        assert "does not belong to Treatment" in str(error)
    else:
        raise AssertionError("Mismatched category filters should fail.")


def test_recommendations_match_inci_terms(tmp_path) -> None:
    (tmp_path / "ingredients.csv").write_text(
        "\n".join(
            [
                "name,ingredient_type,alternate_name,inci_name,important_chemical_component,best_for,can_used_to,not_recommend,personal_care_category,topical_use",
                "Ceramides,lipid,,Ceramide NP; Ceramide AP,,DRNT,barrier,none,moisturizing,barrier support",
            ]
        ),
        encoding="utf-8",
    )
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Ceramide Cream,Brand,Moisturizer,Desc,\"45.650,00\",\"Water, Ceramide NP\",,,",
            ]
        ),
        encoding="utf-8",
    )
    repository = CatalogRepository(tmp_path)
    repository.load()
    service = RecommendationService(repository)

    products, total_candidates = service.recommend_products("DRNT")

    assert total_candidates == 1
    assert products[0].matched_ingredients == ["Ceramides"]
    assert products[0].similarity_score == 1


def test_recommendations_do_not_match_display_name_when_inci_differs(
    tmp_path,
) -> None:
    (tmp_path / "ingredients.csv").write_text(
        "\n".join(
            [
                "name,ingredient_type,alternate_name,inci_name,important_chemical_component,best_for,can_used_to,not_recommend,personal_care_category,topical_use",
                "Marketing Name,functional,,Actual INCI,,DRNT,concern,none,category,use",
            ]
        ),
        encoding="utf-8",
    )
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Name Match Only,Brand,Moisturizer,Desc,\"10.000,00\",\"Water, Marketing Name\",,,",
                "NA2,INCI Match,Brand,Moisturizer,Desc,\"10.000,00\",\"Water, Actual INCI\",,,",
            ]
        ),
        encoding="utf-8",
    )
    repository = CatalogRepository(tmp_path)
    repository.load()
    service = RecommendationService(repository)

    products, total_candidates = service.recommend_products("DRNT", top_k=2)

    assert total_candidates == 1
    assert products[0].name == "INCI Match"
    assert products[0].matched_ingredients == ["Marketing Name"]


def test_more_compatible_inci_matches_rank_higher(tmp_path) -> None:
    (tmp_path / "ingredients.csv").write_text(
        "\n".join(
            [
                "name,ingredient_type,alternate_name,inci_name,important_chemical_component,best_for,can_used_to,not_recommend,personal_care_category,topical_use",
                "Glycerin,humectant,,Glycerin,,ALL,hydration,none,moisturizing,hydration support",
                "Arbutin,brightening,,Alpha-Arbutin,,OSPT,pigmentation,none,brightening,tone support",
                "Kojic Acid,brightening,,Kojic Acid,,OSPT,pigmentation,none,brightening,tone support",
            ]
        ),
        encoding="utf-8",
    )
    (tmp_path / "products.csv").write_text(
        "\n".join(
            [
                "bpom_id,name,brand,category,description,price,ingredients,image_url,product_url,incidecoder_verif",
                "NA1,Generic Hydrator,Brand,Moisturizer,Desc,\"10.000,00\",\"Water, Glycerin\",,,",
                "NA2,Targeted Brightener,Brand,Moisturizer,Desc,\"10.000,00\",\"Water, Alpha-Arbutin\",,,",
                "NA3,Full Coverage Brightener,Brand,Moisturizer,Desc,\"10.000,00\",\"Water, Glycerin, Alpha-Arbutin, Kojic Acid\",,,",
            ]
        ),
        encoding="utf-8",
    )
    repository = CatalogRepository(tmp_path)
    repository.load()
    service = RecommendationService(repository)

    products, total_candidates = service.recommend_products("OSPT", top_k=2)

    assert total_candidates == 3
    assert products[0].name == "Full Coverage Brightener"
    assert products[0].matched_ingredients == ["Glycerin", "Arbutin", "Kojic Acid"]
    assert products[0].similarity_score > products[1].similarity_score
