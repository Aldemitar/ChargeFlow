from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from pydantic import EmailStr, validator
from datetime import date
from sqlalchemy import Column, Boolean, Enum
import enum

# ENUMS PERSONALIZADOS

class TipoBateria(str, enum.Enum):
    LITIO_ION = "Litio-ion"
    PLOMO_ACIDO = "Plomo-ácido"
    NIMH = "NiMH"
    SOLIDA = "Sólida"


class EstadoBateria(str, enum.Enum):
    DISPONIBLE = "Disponible"
    EN_USO = "En uso"
    EN_MANTENIMIENTO = "En mantenimiento"


class RolUsuario(str, enum.Enum):
    ADMIN = "admin"
    TECNICO = "tecnico"
    CLIENTE = "cliente"


class MarcaVehiculo(str, enum.Enum):
    TESLA = "Tesla"
    NISSAN = "Nissan"
    BMW = "BMW"
    RENAULT = "Renault"
    CHEVROLET = "Chevrolet"

class EstadoVehiculo(str, enum.Enum):
    DISPONIBLE = "Disponible"
    EN_TALLER = "En taller"
    EN_MANTENIMIENTO = "En mantenimiento"


class EstadoCita(str, enum.Enum):
    PENDIENTE = "Pendiente"
    EN_PROGRESO = "En progreso"
    COMPLETADA = "Completada"

# MODELOS

class Vehiculo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    marca: MarcaVehiculo
    modelo: str
    año: int
    imagen_url: Optional[str] = Field(default=None, description="URL de la imagen del vehículo")
    estado: EstadoVehiculo = Field(
        sa_column=Column(Enum(EstadoVehiculo), default=EstadoVehiculo.DISPONIBLE)
    )
    eliminado: bool = Field(default=False, sa_column=Column(Boolean, default=False))

    bateria: Optional["Bateria"] = Relationship(
        back_populates="vehiculo",
        sa_relationship_kwargs={"uselist": False}
    )
    citas: List["Cita"] = Relationship(back_populates="vehiculo")


class Bateria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    codigo: str = Field(index=True, unique=True, nullable=False)
    tipo: TipoBateria = Field(sa_column=Column(Enum(TipoBateria), nullable=False))
    capacidad_kWh: float
    estado_salud: float = Field(gt=0, le=100)
    ciclos_carga: Optional[int] = Field(default=0, ge=0)
    temperatura_operacion: Optional[float] = Field(default=None)
    estado: EstadoBateria = Field(
        sa_column=Column(Enum(EstadoBateria), default=EstadoBateria.DISPONIBLE)
    )
    vehiculo_id: Optional[int] = Field(default=None, foreign_key="vehiculo.id")
    eliminado: bool = Field(default=False)

    vehiculo: Optional[Vehiculo] = Relationship(back_populates="bateria")

    @validator("estado_salud")
    def validar_estado_salud(cls, v):
        if not 0 <= v <= 100:
            raise ValueError("El estado de salud debe estar entre 0 y 100.")
        return v


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, min_length=2, max_length=50)
    apellido: str = Field(index=True, min_length=2, max_length=50)
    email: EmailStr = Field(unique=True, index=True)
    telefono: Optional[str] = Field(default=None)
    direccion: Optional[str] = Field(default=None)
    contraseña: str = Field(min_length=6)
    rol: RolUsuario = Field(sa_column=Column(Enum(RolUsuario), nullable=False))
    fecha_registro: date = Field(default_factory=date.today)
    activo: bool = Field(default=True, sa_column=Column(Boolean, default=True))
    eliminado: bool = Field(default=False, sa_column=Column(Boolean, default=False))

    # Relaciones con Cita
    citas_cliente: List["Cita"] = Relationship(
        back_populates="cliente",
        sa_relationship_kwargs={"foreign_keys": "[Cita.cliente_id]"}
    )
    citas_tecnico: List["Cita"] = Relationship(
        back_populates="tecnico",
        sa_relationship_kwargs={"foreign_keys": "[Cita.tecnico_id]"}
    )

    @validator("contraseña")
    def validar_contraseña(cls, v):
        if len(v) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        return v

    @validator("nombre")
    def validar_nombre(cls, v):
        if not all(c.isalpha() or c.isspace() for c in v):
            raise ValueError("El nombre solo puede contener letras y espacios.")
        return v


class Cita(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cliente_id: int = Field(foreign_key="usuario.id")
    tecnico_id: int = Field(foreign_key="usuario.id")
    vehiculo_id: int = Field(foreign_key="vehiculo.id")
    fecha: date
    hora: str
    costo: float
    estado: EstadoCita = Field(sa_column=Column(Enum(EstadoCita), default=EstadoCita.PENDIENTE))

    cliente: Optional[Usuario] = Relationship(
        back_populates="citas_cliente",
        sa_relationship_kwargs={"foreign_keys": "[Cita.cliente_id]"}
    )
    tecnico: Optional[Usuario] = Relationship(
        back_populates="citas_tecnico",
        sa_relationship_kwargs={"foreign_keys": "[Cita.tecnico_id]"}
    )
    vehiculo: Optional[Vehiculo] = Relationship(back_populates="citas")
