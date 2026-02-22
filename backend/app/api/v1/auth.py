"""
Endpoints d'authentification
backend/app/api/v1/auth.py
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import timedelta
from app.core.security import (
    verify_password, 
    create_access_token, 
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    verify_token
)
from fastapi import Depends

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Base de données utilisateurs (en dur pour la démo)
# EN PRODUCTION : Utilisez une vraie base de données !
DEMO_USERS = {
    "admin": {
        "username": "admin",
        "password": get_password_hash("admin123"),
        "role": "admin",
        "email": "admin@aisentinel.com"
    },
    "demo": {
        "username": "demo",
        "password": get_password_hash("demo123"),
        "role": "viewer",
        "email": "demo@aisentinel.com"
    }
}

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    """
    Connexion avec username et password
    
    Comptes disponibles :
    - admin / admin123 (Admin - Tous droits)
    - demo / demo123 (Viewer - Lecture seule)
    """
    user = DEMO_USERS.get(credentials.username)
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer le token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "role": user["role"],
            "email": user["email"]
        }
    }

@router.get("/me")
async def get_current_user(user: dict = Depends(verify_token)):
    """Obtenir les informations de l'utilisateur connecté"""
    user_data = DEMO_USERS.get(user["username"])
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "username": user_data["username"],
        "role": user_data["role"],
        "email": user_data["email"]
    }

@router.post("/logout")
async def logout():
    """Déconnexion (côté client uniquement)"""
    return {"message": "Successfully logged out"}
