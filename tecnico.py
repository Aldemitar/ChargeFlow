import asyncio
from sqlmodel import select
from utils.connection_db import get_session
from utils.auth import hash_password
from data.models import Usuario, RolUsuario

async def insertar_tecnico():
    session_gen = get_session()
    session = await anext(session_gen)
    try:
        email = "tecnico@chargeflow.com"
        nombre = "Carlos"
        apellido = "Ramírez"
        password = "123456"

        result = await session.exec(select(Usuario).where(Usuario.email == email))
        existente = result.first()
        if existente:
            print(f"⚠️ Ya existe un usuario con el email: {email}")
            return

        nuevo_tecnico = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            contraseña=hash_password(password),
            rol=RolUsuario.TECNICO,
            activo=True,
            eliminado=False
        )

        session.add(nuevo_tecnico)
        await session.commit()
        await session.refresh(nuevo_tecnico)
        print(f"✅ Técnico creado con éxito: {nuevo_tecnico.nombre} ({nuevo_tecnico.email})")

    finally:
        await session_gen.aclose()

if __name__ == "__main__":
    asyncio.run(insertar_tecnico())
