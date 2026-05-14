from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
def read_hello():
    return {"message": "Hello from your Python 3.11 Backend!"}