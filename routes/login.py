from fastapi import APIRouter, Request, Form, Depends, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.templating import Jinja2Templates

from utils.auth import verify_password, create_access_token, get_user_by_email
from utils.connection_db import get_session
from data.models import RolUsuario

router = APIRouter(prefix="/login", tags=["Login"])
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def login_get(request: Request):
    return templates.TemplateResponse(
        "login/login.html",
        {"request": request, "titulo": "Iniciar sesión"}
    )


@router.post("/", response_class=HTMLResponse)
async def login_post(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    session: AsyncSession = Depends(get_session)
):
    user = await get_user_by_email(session, email)

    if not user or not verify_password(password, user.contraseña):
        context = {"request": request, "titulo": "Iniciar sesión", "error": "Credenciales incorrectas."}
        return templates.TemplateResponse(
            "login/login.html",
            context,
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    access_token = create_access_token(data={"sub": user.email})

    if user.rol == RolUsuario.ADMIN:
        redirect_url = "/admin/dashboard"
    elif user.rol == RolUsuario.TECNICO:
        redirect_url = "/tecnico/dashboard"
    elif user.rol == RolUsuario.CLIENTE:
        redirect_url = "/cliente/dashboard"
    else:
        redirect_url = "/"

    response = RedirectResponse(url=redirect_url, status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=3600
    )
    return response


@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie("access_token")
    return response
