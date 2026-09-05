from pathlib import Path

from flask import Flask, jsonify, request

from recommender import ProductRecommender


app = Flask(__name__)
recommender = ProductRecommender(str(Path(__file__).with_name("products.csv")))


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/recommend/user")
def recommend_user():
    payload = request.get_json(force=True)
    product_ids = recommender.recommend_for_user(
        user_id=payload.get("user_id"),
        products=payload.get("products"),
        activities=payload.get("activities"),
        orders=payload.get("orders"),
    )
    return jsonify({"product_ids": product_ids})


@app.post("/recommend/similar")
def recommend_similar():
    payload = request.get_json(force=True)
    product_ids = recommender.recommend_similar(
        product_id=payload.get("product_id"),
        products=payload.get("products"),
    )
    return jsonify({"product_ids": product_ids})


@app.post("/recommend/trending")
def recommend_trending():
    payload = request.get_json(force=True)
    product_ids = recommender.recommend_trending(
        products=payload.get("products"),
        activities=payload.get("activities"),
    )
    return jsonify({"product_ids": product_ids})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
