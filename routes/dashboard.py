from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date

from utils.auth import require_roles
from utils.connection_db import get_session
from data.models import Cita, Usuario, EstadoCita, RolUsuario

router = APIRouter(prefix="", tags=["Dashboard"])
templates = Jinja2Templates(directory="templates")

# Templates de administrador
@router.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(
    request: Request,
    user=Depends(require_roles(RolUsuario.ADMIN))
):
    """
    Dashboard del administrador — muestra acceso a paneles globales.
    """
    return templates.TemplateResponse(
        "admin/adminDashboard.html",
        {"request": request, "user": user}
    )

@router.get("/admin/ganancias", response_class=HTMLResponse)
async def admin_ganancias(
    request: Request,
    user=Depends(require_roles(RolUsuario.ADMIN))
):
    """
    Dashboard de ganancias — muestra los ingresos del taller.
    """
    return templates.TemplateResponse(
        "admin/gananciasAdmin.html",
        {"request": request, "user": user}
    )

@router.get("/admin/tecnicos", response_class=HTMLResponse)
async def admin_tecnicos(
    request: Request,
    user=Depends(require_roles(RolUsuario.ADMIN))
):
    """
    Dashboard de técnicos — muestra los técnicos del taller.
    """
    return templates.TemplateResponse(
        "admin/tecnicosAdmin.html",
        {"request": request, "user": user}
    )


# Templates de técnico
@router.get("/tecnico/dashboard", response_class=HTMLResponse)
async def dashboard_tecnico(
    request: Request,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user

    MAX_CITAS = 100
    result = await session.execute(
        select(Cita)
        .where(Cita.tecnico_id == tecnico.id)
        .order_by(Cita.fecha)
        .limit(MAX_CITAS)
    )
    citas = result.scalars().all()

    pendientes, en_progreso, completadas = [], [], []
    hoy = date.today()
    citas_hoy_count = 0
    ingresos_mes = 0
    total_clientes_set = set()
    vehiculos_taller_count = 0

    for c in citas:
        total_clientes_set.add(c.cliente_id)

        if c.estado == EstadoCita.PENDIENTE:
            pendientes.append(c)
        elif c.estado == EstadoCita.EN_PROGRESO:
            en_progreso.append(c)
        elif c.estado == EstadoCita.COMPLETADA:
            completadas.append(c)

        c_fecha = c.fecha.date() if isinstance(c.fecha, datetime) else c.fecha
        if c_fecha == hoy:
            citas_hoy_count += 1

        if c.estado == EstadoCita.COMPLETADA and c_fecha.month == hoy.month and c_fecha.year == hoy.year:
            ingresos_mes += c.costo

        if c.estado != EstadoCita.COMPLETADA:
            vehiculos_taller_count += 1

    return templates.TemplateResponse(
        "tecnico/tecnicoDashboard.html",
        {
            "request": request,
            "tecnico": tecnico,
            "citas_pendientes": pendientes,
            "citas_en_progreso": en_progreso,
            "citas_completadas": completadas,
            "citas_hoy": citas_hoy_count,
            "ingresos_mes": ingresos_mes,
            "total_clientes": len(total_clientes_set),
            "vehiculos_taller": vehiculos_taller_count,
        }
    )

@router.get("/tecnico/citas", response_class=HTMLResponse)
async def tecnico_citas(
    request: Request,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    """
    Dashboard de citas — muestra las citas que crea un técnico.
    """
    return templates.TemplateResponse(
        "tecnico/tecnicoCitas.html",
        {"request": request, "user": user}
    )

@router.get("/tecnico/clientes", response_class=HTMLResponse)
async def tecnico_clientes(
    request: Request,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    """
    Dashboard de clientes — muestra los clientes que crea un técnico.
    """
    return templates.TemplateResponse(
        "tecnico/tecnicoClientes.html",
        {"request": request, "user": user}
    )

@router.get("/tecnico/vehiculos", response_class=HTMLResponse)
async def tecnico_vehiculos(
    request: Request,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    """
    Dashboard de vehiculos — muestra los vehiculos que crea un técnico.
    """
    return templates.TemplateResponse(
        "tecnico/tecnicoVehiculos.html",
        {"request": request, "user": user}
    )

@router.get("/tecnico/baterias", response_class=HTMLResponse)
async def tecnico_baterias(
    request: Request,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    """
    Dashboard de baterías — muestra las baterías que crea un técnico.
    """
    return templates.TemplateResponse(
        "tecnico/tecnicoBaterias.html",
        {"request": request, "user": user}
    )


# Templates de cliente
@router.get("/cliente/dashboard", response_class=HTMLResponse)
async def cliente_dashboard(
    request: Request,
    user=Depends(require_roles(RolUsuario.CLIENTE)),
    session: AsyncSession = Depends(get_session)
):
    """
    Dashboard del cliente — muestra sus datos y citas.
    """
    return templates.TemplateResponse(
        "cliente/clienteDashboard.html",
        {"request": request, "user": user}
    )

@router.get("/cliente/dashboard", response_class=HTMLResponse)
async def cliente_dashboard(
    request: Request,
    user=Depends(require_roles(RolUsuario.CLIENTE)),
    session: AsyncSession = Depends(get_session)
):
    """
    Dashboard del cliente — muestra sus datos y citas.
    """
    return templates.TemplateResponse(
        "cliente/clienteDashboard.html",
        {"request": request, "user": user}
    )

@router.get("/cliente/perfil", response_class=HTMLResponse)
async def cliente_perfil(
    request: Request,
    user=Depends(require_roles(RolUsuario.CLIENTE)),
    session: AsyncSession = Depends(get_session)
):
    """
    Perfil del cliente — permite cambiar contraseña y foto de perfil
    """
    return templates.TemplateResponse(
        "cliente/perfilCliente.html",
        {"request": request, "user": user}
    )