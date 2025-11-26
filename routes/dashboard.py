from fastapi import APIRouter, Request, Depends, Query, Form, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from datetime import date
import math 
from math import ceil

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlmodel import select, SQLModel, Field, Relationship
from typing import Optional, List, Annotated
from pydantic import EmailStr, validator
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import Column, Boolean, Enum
import enum
from sqlmodel import select, func

from utils.auth import require_roles
from utils.connection_db import get_session
from data.models import Cita, Usuario, EstadoCita, RolUsuario, CitaCreate, Vehiculo, ClienteSelect, VehiculoSelect, ClienteRead, ClienteCreate, ClienteUpdate, VehiculoCreate, VehiculoRead, VehiculoUpdate, EstadoVehiculo

router = APIRouter(prefix="", tags=["Dashboard"])
templates = Jinja2Templates(directory="templates")

@router.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(
    request: Request,
    user=Depends(require_roles(RolUsuario.ADMIN))
):
    
    admin = user

    return templates.TemplateResponse(
        "admin/adminDashboard.html",
        {"request": request, "admin": admin}
    )

@router.get("/admin/ganancias", response_class=HTMLResponse)
async def admin_ganancias(
    request: Request,
    user=Depends(require_roles(RolUsuario.ADMIN))
):
    
    admin = user

    return templates.TemplateResponse(
        "admin/gananciasAdmin.html",
        {"request": request, "admin": admin}
    )

@router.get("/admin/tecnicos", response_class=HTMLResponse)
async def admin_tecnicos(
    request: Request,
    user=Depends(require_roles(RolUsuario.ADMIN))
):
    
    admin = user

    return templates.TemplateResponse(
        "admin/tecnicoAdmin.html",
        {"request": request, "admin": admin}
    )

# Templates de técnico
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

ITEMS_PER_PAGE = 10

@router.get("/tecnico/vehiculos", response_class=HTMLResponse)
async def tecnico_vehiculos(
    request: Request,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session),
    page: int = Query(1, ge=1),
    search: Optional[str] = Query(None)
):
    tecnico = user
    offset = (page - 1) * ITEMS_PER_PAGE

    main_statement = (
        select(Vehiculo)
        .where(Vehiculo.eliminado == False)
        .options(selectinload(Vehiculo.citas).selectinload(Cita.cliente))
    )

    if search:
        search_term = f"%{search}%"

        main_statement = main_statement.join(Cita, isouter=True).join(Usuario, Cita.cliente_id == Usuario.id, isouter=True).where(
            (Vehiculo.marca.cast(str).like(search_term)) |
            (Vehiculo.modelo.like(search_term)) |
            (Usuario.nombre.like(search_term)) |
            (Usuario.apellido.like(search_term))
        ).distinct()
    subquery = main_statement.subquery()
    count_statement = select(func.count(subquery.c.id))

    total_vehiculos = await session.scalar(count_statement)

    total_vehiculos = total_vehiculos or 0

    total_pages = ceil(total_vehiculos / ITEMS_PER_PAGE) if total_vehiculos > 0 else 1

    main_statement = main_statement.offset(offset).limit(ITEMS_PER_PAGE)
    
    vehiculos_result = await session.exec(main_statement)
    vehiculos = vehiculos_result.unique().all()

    vehiculos_para_html = []
    for v in vehiculos:
        cliente_info = "Sin Asignar"

        if v.citas:
            citas_ordenadas = sorted(v.citas, key=lambda c: c.fecha, reverse=True)
            cita_reciente = citas_ordenadas[0]
            
            if cita_reciente and cita_reciente.cliente:
                cliente_info = f"{cita_reciente.cliente.nombre} {cita_reciente.cliente.apellido}"
                
        vehiculos_para_html.append({
            "id": v.id,
            "marca": v.marca,
            "modelo": v.modelo,
            "año": v.año,
            "estado": v.estado,
            "cliente_asociado": cliente_info,
        })

    start_item = min(offset + 1, total_vehiculos)
    end_item = min(offset + ITEMS_PER_PAGE, total_vehiculos)

    return templates.TemplateResponse(
        "tecnico/tecnicoVehiculos.html",
        {
            "request": request, 
            "tecnico": tecnico, 
            "vehiculos": vehiculos_para_html,
            "search": search,
            "page": page,
            "total_vehiculos": total_vehiculos,
            "total_pages": total_pages,
            "start_item": start_item,
            "end_item": end_item,
        }
    )

@router.post("/api/v1/tecnico/vehiculos", 
             response_model=VehiculoRead, 
             status_code=status.HTTP_201_CREATED)
async def create_vehiculo(
    vehiculo_in: VehiculoCreate,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):

    nuevo_vehiculo = Vehiculo.model_validate(vehiculo_in, update={'estado': EstadoVehiculo.DISPONIBLE})
    
    try:
        session.add(nuevo_vehiculo)
        await session.commit()
        await session.refresh(nuevo_vehiculo)
        return nuevo_vehiculo
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error al crear el vehículo: {str(e)}"
        )

@router.get("/api/v1/tecnico/vehiculos/{vehiculo_id}", response_model=VehiculoRead)
async def read_vehiculo(
    vehiculo_id: int,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    
    vehiculo = await session.get(Vehiculo, vehiculo_id)
    
    if not vehiculo or vehiculo.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vehículo no encontrado"
        )
        
    return vehiculo

@router.patch("/api/v1/tecnico/vehiculos/{vehiculo_id}", response_model=VehiculoRead)
async def update_vehiculo(
    vehiculo_id: int,
    vehiculo_in: VehiculoUpdate,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    
    vehiculo = await session.get(Vehiculo, vehiculo_id)
    
    if not vehiculo or vehiculo.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vehículo no encontrado"
        )

    update_data = vehiculo_in.model_dump(exclude_unset=True)
    vehiculo.model_validate(update_data, update=True)
    
    session.add(vehiculo)
    await session.commit()
    await session.refresh(vehiculo)
    return vehiculo

@router.delete("/api/v1/tecnico/vehiculos/{vehiculo_id}", status_code=status.HTTP_200_OK)
async def soft_delete_vehiculo(
    vehiculo_id: int,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    
    vehiculo = await session.get(Vehiculo, vehiculo_id)
    
    if not vehiculo or vehiculo.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vehículo no encontrado o ya eliminado"
        )

    vehiculo.eliminado = True
    session.add(vehiculo)

    if vehiculo.estado == EstadoVehiculo.DISPONIBLE:
        vehiculo.estado = EstadoVehiculo.EN_TALLER
        
    await session.commit()
    
    return {"message": f"Vehículo con ID {vehiculo_id} eliminado lógicamente."}

@router.get("/tecnico/baterias", response_class=HTMLResponse)
async def tecnico_baterias(
    request: Request,
    user=Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    tecnico = user
    return templates.TemplateResponse(
        "tecnico/tecnicoBaterias.html",
        {"request": request, "tecnico": tecnico}
    )

@router.get("/cliente/dashboard", response_class=HTMLResponse)
async def cliente_dashboard(
    request: Request,
    user=Depends(require_roles(RolUsuario.CLIENTE)),
    session: AsyncSession = Depends(get_session)
):
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
        estado_filtro = "Todas"
    else:
        base_query = base_query.where(
            Cita.estado.in_([EstadoCita.PENDIENTE, EstadoCita.EN_PROGRESO])
        )
        estado_filtro = "Activas"

    if search:
        search_term = f"%{search}%"

        base_query = base_query.join(Cita.cliente).join(Cita.vehiculo).where(
            or_(
                Usuario.nombre.ilike(search_term), 
                Usuario.apellido.ilike(search_term), 
                Vehiculo.modelo.ilike(search_term),
            )
        )

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

    total_pages = math.ceil(total_citas / page_size) if total_citas > 0 else 1
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
            "estado_filtro": estado_filtro, 
            "search": search or "",
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

@router.post("/tecnico/clientes") 
async def crear_cliente(
    nombre: Annotated[str, Form()],
    apellido: Annotated[str, Form()],
    email: Annotated[EmailStr, Form()],
    contraseña: Annotated[str, Form()],
    telefono: Annotated[Optional[str], Form()] = None,
    direccion: Annotated[Optional[str], Form()] = None,
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    existing_user_result = await session.execute(
        select(Usuario).where(Usuario.email == email, Usuario.eliminado == False)
    )
    if existing_user_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con este correo electrónico."
        )

    nuevo_cliente = Usuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        telefono=telefono,
        direccion=direccion,
        contraseña=contraseña,
        rol=RolUsuario.CLIENTE,
        fecha_registro=date.today()
    )
    
    session.add(nuevo_cliente)
    await session.commit()
    return RedirectResponse(url="/tecnico/clientes", status_code=status.HTTP_303_SEE_OTHER)

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

@router.post("/tecnico/clientes/{cliente_id}") 
async def actualizar_cliente(
    cliente_id: int,
    method: Annotated[str, Form()], # 👈 CAMBIO CLAVE: Usamos 'method'
    nombre: Annotated[Optional[str], Form()] = None,
    apellido: Annotated[Optional[str], Form()] = None,
    email: Annotated[Optional[EmailStr], Form()] = None,
    telefono: Annotated[Optional[str], Form()] = None,
    direccion: Annotated[Optional[str], Form()] = None,
    activo: Annotated[Optional[bool], Form()] = None,
    
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    if method.upper() != "PUT": 
        raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail="Método no permitido. Use PUT simulado.")

    cliente = await session.get(Usuario, cliente_id)
    
    if not cliente or cliente.rol != RolUsuario.CLIENTE or cliente.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado."
        )
    update_data = {
        "nombre": nombre, "apellido": apellido, "email": email, 
        "telefono": telefono, "direccion": direccion, "activo": activo
    }
    
    for key, value in update_data.items():
        if value is not None:
            setattr(cliente, key, value)
            
    session.add(cliente)
    await session.commit()
    return RedirectResponse(url="/tecnico/clientes", status_code=status.HTTP_303_SEE_OTHER)

@router.post("/tecnico/clientes/{cliente_id}/eliminar") 
async def eliminar_cliente(
    cliente_id: int,
    method: Annotated[str, Form()], 
    user: Usuario = Depends(require_roles(RolUsuario.TECNICO)),
    session: AsyncSession = Depends(get_session)
):
    if method.upper() != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED, 
            detail="Método no permitido. Use POST con campo method='DELETE'."
        )

    cliente = await session.get(Usuario, cliente_id)
    
    if not cliente or cliente.rol != RolUsuario.CLIENTE or cliente.eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado o ya eliminado."
        )

    try:
        cliente.eliminado = True

        cliente.activo = False 
        
        session.add(cliente)

        await session.commit() 
        
    except Exception as e:
        await session.rollback()
        print(f"Error al eliminar cliente {cliente_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al procesar la eliminación del cliente."
        )

    return RedirectResponse(url="/tecnico/clientes", status_code=status.HTTP_303_SEE_OTHER)