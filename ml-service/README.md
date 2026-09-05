# ML Service

Local Flask recommendation service for `ai-product-recommendation-ecommerce`.

## Endpoints

- `GET /health`
- `POST /recommend/user`
- `POST /recommend/similar`
- `POST /recommend/trending`

## Run

```bash
pip install -r requirements.txt
python app.py
```

The service starts on `http://127.0.0.1:8000`.
