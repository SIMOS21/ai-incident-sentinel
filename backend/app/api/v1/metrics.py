from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def metrics_test():
    return {"metrics": "ok"}
