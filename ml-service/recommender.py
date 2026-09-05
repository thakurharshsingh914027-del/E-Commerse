import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ProductRecommender:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.catalog = pd.read_csv(csv_path)
        self.catalog["tags"] = self.catalog["tags"].fillna("").apply(
            lambda value: value.split("|") if isinstance(value, str) else []
        )
        self._build_catalog_vectors(self.catalog)

    def _prepare_products(self, products):
        frame = pd.DataFrame(products).copy()
        if frame.empty:
            return frame

        if "tags" not in frame.columns:
            frame["tags"] = [[] for _ in range(len(frame))]
        else:
            frame["tags"] = frame["tags"].apply(
                lambda value: value if isinstance(value, list) else str(value).split("|")
            )
        return frame

    def _build_catalog_vectors(self, frame: pd.DataFrame):
        working = frame.copy()
        working["content"] = (
            working["name"].fillna("")
            + " "
            + working["category"].fillna("")
            + " "
            + working["brand"].fillna("")
            + " "
            + working["description"].fillna("")
            + " "
            + working["tags"].apply(lambda tags: " ".join(tags if isinstance(tags, list) else []))
        )
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.content_matrix = self.vectorizer.fit_transform(working["content"])
        self.catalog_vectors = working

    def _get_frame(self, products):
        if products:
            frame = self._prepare_products(products)
            self._build_catalog_vectors(frame)
            return frame

        self._build_catalog_vectors(self.catalog)
        return self.catalog

    def recommend_similar(self, product_id, products=None, limit=8):
        frame = self._get_frame(products)
        frame["_id"] = frame["_id"].astype(str)

        if product_id not in frame["_id"].values:
            return []

        index = frame.index[frame["_id"] == product_id][0]
        similarities = cosine_similarity(self.content_matrix[index], self.content_matrix).flatten()
        ranked = similarities.argsort()[::-1]

        recommendations = []
        for item_index in ranked:
            candidate_id = frame.iloc[item_index]["_id"]
            if candidate_id == product_id:
                continue
            recommendations.append(candidate_id)
            if len(recommendations) >= limit:
                break

        return recommendations

    def recommend_for_user(self, user_id, products=None, activities=None, orders=None, limit=8):
        frame = self._get_frame(products)
        frame["_id"] = frame["_id"].astype(str)

        activities = activities or []
        orders = orders or []

        purchased_ids = {
            str(item["product"])
            for order in orders
            for item in order.get("items", [])
        }

        weighted_actions = {
            "view": 1,
            "like": 3,
            "cart": 4,
            "purchase": 5,
        }

        profile_parts = []
        engaged_ids = []

        for activity in activities:
            if str(activity.get("userId")) != str(user_id):
                continue

            weight = weighted_actions.get(activity.get("actionType"), 1)
            profile = f"{activity.get('category', '')} {' '.join(activity.get('tags', []))}"
            profile_parts.extend([profile] * weight)
            engaged_ids.append(str(activity.get("productId")))

        if not profile_parts and engaged_ids:
            sampled_products = frame[frame["_id"].isin(engaged_ids)]
            profile_parts.append(" ".join(sampled_products["content"].tolist()))

        if not profile_parts:
            return self.recommend_trending(products=products, activities=activities, limit=limit)

        profile_vector = self.vectorizer.transform([" ".join(profile_parts)])
        similarity_scores = cosine_similarity(profile_vector, self.content_matrix).flatten()
        frame = frame.copy()
        frame["score"] = similarity_scores
        frame["engagement_boost"] = frame["_id"].apply(lambda value: 0.04 if value in engaged_ids else 0)
        frame["final_score"] = (
            frame["score"]
            + frame["engagement_boost"]
            + (frame["rating"].fillna(0) / 10)
            + (frame["salesCount"].fillna(0) / 1000)
        )

        ranked = (
            frame[~frame["_id"].isin(purchased_ids)]
            .sort_values("final_score", ascending=False)
            .head(limit)
        )

        return ranked["_id"].tolist()

    def recommend_trending(self, products=None, activities=None, limit=8):
        frame = self._get_frame(products).copy()
        frame["_id"] = frame["_id"].astype(str)

        activities = activities or []
        activity_counts = {}
        for activity in activities:
            product_id = str(activity.get("productId"))
            activity_counts[product_id] = activity_counts.get(product_id, 0) + 1

        frame["activityBoost"] = frame["_id"].apply(lambda value: activity_counts.get(value, 0))
        frame["trendScore"] = (
            frame["salesCount"].fillna(0) * 3
            + frame["rating"].fillna(0) * 10
            + frame["activityBoost"]
        )

        return frame.sort_values("trendScore", ascending=False).head(limit)["_id"].tolist()
