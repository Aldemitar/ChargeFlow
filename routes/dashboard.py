from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
import math

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlmodel import select, SQLModel, Field, Relationship
from typing import Optional, List
from pydantic import EmailStr, validator
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import Column, Boolean, Enum
import enum
from sqlmodel import select, func

from utils.auth import require_roles
from utils.connection_db import get_session
from data.models import Cita, Usuario, EstadoCita, RolUsuario, CitaCreate, Vehiculo, ClienteSelect, VehiculoSelect, ClienteRead, ClienteCreate, ClienteUpdate

router = APIRouter(prefix="", tags=["Dashboard"])
templates = Jinja2Templates(directory="templates")

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

@router.get("/tecnico/dashboard", response_class=HTMLResponse)
async def dashboard_tecnico(
    request: Request,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user
    hoy = date.today()
    MAX_CITAS = 100

    result = await session.execute(
        select(Cita)
        .where(Cita.tecnico_id == tecnico.id)
        .options(
            selectinload(Cita.cliente),
            selectinload(Cita.vehiculo)
        )
        .order_by(Cita.fecha.desc())
        .limit(MAX_CITAS)
    )
    citas: List[Cita] = result.scalars().unique().all()

    citas_pendientes, citas_en_progreso, citas_completadas = [], [], []
    citas_hoy_count = 0
    ingresos_mes = 0.0
    total_clientes_set = set()
    vehiculos_activos_set = set()

    for c in citas:
        c_fecha = c.fecha.date() if isinstance(c.fecha, datetime) else c.fecha

        if c.estado == EstadoCita.PENDIENTE:
            citas_pendientes.append(c)
        elif c.estado == EstadoCita.EN_PROGRESO:
            citas_en_progreso.append(c)
        elif c.estado == EstadoCita.COMPLETADA:
            citas_completadas.append(c)

        if c_fecha == hoy:
            citas_hoy_count += 1

        total_clientes_set.add(c.cliente_id)

        if c.estado == EstadoCita.COMPLETADA and c_fecha.month == hoy.month and c_fecha.year == hoy.year:
            ingresos_mes += c.costo

        if c.estado in [EstadoCita.PENDIENTE, EstadoCita.EN_PROGRESO]:
             vehiculos_activos_set.add(c.vehiculo_id)

    return templates.TemplateResponse(
        "tecnico/tecnicoDashboard.html",
        {
            "request": request,
            "tecnico": tecnico,
            "citas_pendientes": citas_pendientes,
            "citas_en_progreso": citas_en_progreso,
            "citas_completadas": citas_completadas,
            "citas_hoy": citas_hoy_count,
            "ingresos_mes": f"{ingresos_mes:.2f}",
            "total_clientes": len(total_clientes_set),
            "vehiculos_taller": len(vehiculos_activos_set)
        }
    )

@router.get("/cliente/dashboard", response_class=HTMLResponse)
async def cliente_dashboard(
    request: Request,
    user=Depends(require_roles(RolUsuario.CLIENTE))
):
    """
    Dashboard del cliente — muestra sus datos y citas.
    """
    return templates.TemplateResponse(
        "cliente/clienteDashboard.html",
        {"request": request, "user": user}
    )

def obtener_estado_cita(estado_str: Optional[str]) -> Optional[EstadoCita]:
    if not estado_str:
        return None
    estado_map = {
        "PENDIENTE": EstadoCita.PENDIENTE,
        "EN_PROGRESO": EstadoCita.EN_PROGRESO,
        "EN CURSO": EstadoCita.EN_PROGRESO,
        "COMPLETADA": EstadoCita.COMPLETADA,
    }

    key = estado_str.upper().replace(' ', '_')
    return estado_map.get(key)


@router.get("/tecnico/citas", response_class=HTMLResponse)
async def citas_tecnico(
    request: Request,
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=5, le=50, description="Tamaño de página"),
    estado_filtro: Optional[str] = Query(None, description="Filtrar por estado"),
    search: Optional[str] = Query(None, description="Término de búsqueda"),
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user
    offset = (page - 1) * page_size

    base_query = select(Cita).where(Cita.tecnico_id == tecnico.id)

    estado_enum = obtener_estado_cita(estado_filtro)
    
    if estado_enum:
        base_query = base_query.where(Cita.estado == estado_enum)
    elif estado_filtro and estado_filtro.upper() == "TODAS":
        pass
    else:
        base_query = base_query.where(
            Cita.estado.in_([EstadoCita.PENDIENTE, EstadoCita.EN_PROGRESO])
        )
        estado_filtro = "Activas"

    count_query = select(func.count()).select_from(base_query.subquery())
    total_citas_result = await session.execute(count_query)
    total_citas = total_citas_result.scalar_one()

    result = await session.execute(
        base_query
        .options(
            selectinload(Cita.cliente),
            selectinload(Cita.vehiculo)
        )
        .order_by(Cita.fecha.desc(), Cita.hora)
        .offset(offset)
        .limit(page_size)
    )
    citas: List[Cita] = result.scalars().unique().all()

    total_pages = math.ceil(total_citas / page_size)
    start_item = offset + 1 if total_citas > 0 else 0
    end_item = min(offset + page_size, total_citas)

    return templates.TemplateResponse(
        "tecnico/tecnicoCitas.html",
        {
            "request": request,
            "tecnico": tecnico,
            "citas": citas,
            "page": page,
            "page_size": page_size,
            "total_citas": total_citas,
            "total_pages": total_pages,
            "start_item": start_item,
            "end_item": end_item,
            "estado_filtro": estado_filtro or "Activas",
            "tecnico_logueado_id": tecnico.id
        }
    )

@router.post("/tecnico/citas/nueva", response_model=Cita)
async def crear_nueva_cita(
    cita_in: CitaCreate,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user
    cliente_result = await session.execute(
        select(Usuario).where(Usuario.id == cita_in.cliente_id, Usuario.eliminado == False)
    )
    cliente_existente = cliente_result.scalar_one_or_none()
    if not cliente_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cita_in.cliente_id} no encontrado."
        )

    vehiculo_result = await session.execute(
        select(Vehiculo).where(Vehiculo.id == cita_in.vehiculo_id, Vehiculo.eliminado == False)
    )
    vehiculo_existente = vehiculo_result.scalar_one_or_none()
    if not vehiculo_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehículo con ID {cita_in.vehiculo_id} no encontrado."
        )
    cita_data = cita_in.dict()
    
    nueva_cita = Cita(
        **cita_data,
        tecnico_id=tecnico.id, 
        estado=EstadoCita.PENDIENTE 
    )
    try:
        session.add(nueva_cita)
        await session.commit()
        await session.refresh(nueva_cita)
        return nueva_cita
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al guardar la nueva cita en la base de datos."
        )
    
@router.get("/tecnico/cita/nueva", response_class=HTMLResponse)
async def mostrar_formulario_cita(
    request: Request,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user
    clientes_result = await session.execute(
        select(Usuario.id, Usuario.nombre, Usuario.apellido)
        .where(
            Usuario.rol == RolUsuario.CLIENTE, 
            Usuario.activo == True, 
            Usuario.eliminado == False
        )
        .order_by(Usuario.apellido, Usuario.nombre)
    )
    clientes_list = [
        ClienteSelect(id=id_, nombre=nombre, apellido=apellido) 
        for id_, nombre, apellido in clientes_result.all()
    ]

    vehiculos_result = await session.execute(
        select(Vehiculo.id, Vehiculo.marca, Vehiculo.modelo)
        .where(
            Vehiculo.eliminado == False
        )
        .order_by(Vehiculo.marca, Vehiculo.modelo)
    )
    vehiculos_list = [
        VehiculoSelect(id=id_, marca=marca.value, modelo=modelo) 
        for id_, marca, modelo in vehiculos_result.all()
    ]

    return templates.TemplateResponse(
        "tecnico/tecnicoCitaNueva.html",
        {
            "request": request,
            "tecnico": tecnico, 
            "clientes": clientes_list,
            "vehiculos": vehiculos_list,
            "today": date.today().isoformat(),
        }
    )

@router.get("/tecnico/clientes", response_class=HTMLResponse)
async def listar_clientes(
    request: Request,
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=5, le=50, description="Tamaño de página"),
    search: Optional[str] = Query(None, description="Término de búsqueda por nombre, apellido o email"),
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user
    offset = (page - 1) * page_size

    base_query = select(Usuario).where(
        Usuario.rol == RolUsuario.CLIENTE,
        Usuario.eliminado == False
    )

    if search:
        search_pattern = f"%{search}%"
        base_query = base_query.where(
            or_(
                Usuario.nombre.ilike(search_pattern),
                Usuario.apellido.ilike(search_pattern),
                Usuario.email.ilike(search_pattern),
            )
        )

    count_query = select(func.count()).select_from(base_query.subquery())
    total_clientes_result = await session.execute(count_query)
    total_clientes = total_clientes_result.scalar_one()

    result = await session.execute(
        base_query
        .order_by(Usuario.apellido, Usuario.nombre)
        .offset(offset)
        .limit(page_size)
    )
    clientes: List[Usuario] = result.scalars().unique().all()

    total_pages = math.ceil(total_clientes / page_size)
    start_item = offset + 1 if total_clientes > 0 else 0
    end_item = min(offset + page_size, total_clientes)

    return templates.TemplateResponse(
        "tecnico/tecnicoClientes.html",
        {
            "request": request,
            "tecnico": tecnico,
            "clientes": clientes,
            "page": page,
            "page_size": page_size,
            "total_clientes": total_clientes,
            "total_pages": total_pages,
            "start_item": start_item,
            "end_item": end_item,
            "search": search or "",
        }
    )

@router.post("/tecnico/clientes", response_model=ClienteRead)
async def crear_cliente(
    cliente_in: ClienteCreate,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    existing_user_result = await session.execute(
        select(Usuario).where(Usuario.email == cliente_in.email, Usuario.eliminado == False)
    )
    if existing_user_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con este correo electrónico."
        )
    cliente_data = cliente_in.dict()
    nuevo_cliente = Usuario(
        **cliente_data,
        rol=RolUsuario.CLIENTE,
        fecha_registro=date.today()
    )
    session.add(nuevo_cliente)
    await session.commit()
    await session.refresh(nuevo_cliente)
    return nuevo_cliente

@router.get("/tecnico/clientes/{cliente_id}", response_model=ClienteRead)
async def obtener_detalle_cliente(
    cliente_id: int,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    cliente = await session.get(Usuario, cliente_id)
    
    if not cliente or cliente.rol != RolUsuario.CLIENTE or cliente.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado."
        )
    
    return cliente

@router.put("/tecnico/clientes/{cliente_id}", response_model=ClienteRead)
async def actualizar_cliente(
    cliente_id: int,
    cliente_in: ClienteUpdate,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    cliente = await session.get(Usuario, cliente_id)
    
    if not cliente or cliente.rol != RolUsuario.CLIENTE or cliente.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado."
        )

    update_data = cliente_in.dict(exclude_unset=True)

    if 'email' in update_data and update_data['email'] != cliente.email:
         existing_user_result = await session.execute(
            select(Usuario).where(Usuario.email == update_data['email'], Usuario.id != cliente_id, Usuario.eliminado == False)
        )
         if existing_user_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe otro usuario activo con este correo electrónico."
            )

    for key, value in update_data.items():
        setattr(cliente, key, value)
        
    session.add(cliente)
    await session.commit()
    await session.refresh(cliente)
    
    return cliente

@router.delete("/tecnico/clientes/{cliente_id}")
async def eliminar_cliente(
    cliente_id: int,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    cliente = await session.get(Usuario, cliente_id)
    
    if not cliente or cliente.rol != RolUsuario.CLIENTE or cliente.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado o ya eliminado."
        )

    cliente.eliminado = True
    cliente.activo = False
    
    session.add(cliente)
    await session.commit()
    
    return

