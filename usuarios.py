import asyncio
from sqlmodel import select
from utils.connection_db import get_session
from utils.auth import hash_password
from data.models import Usuario, RolUsuario


# 🧰 Función genérica para insertar usuario
async def insertar_usuario(nombre, apellido, email, password, rol):
    session_gen = get_session()
    session = await anext(session_gen)
    try:
        result = await session.exec(select(Usuario).where(Usuario.email == email))
        existente = result.first()
        if existente:
            print(f"⚠️ Ya existe un usuario con el email: {email}")
            return

        nuevo_usuario = Usuario(
            nombre=nombre,
            apellido=apellido,
            email=email,
            contraseña=hash_password(password),
            rol=rol,
            activo=True,
            eliminado=False
        )

        session.add(nuevo_usuario)
        await session.commit()
        await session.refresh(nuevo_usuario)
        print(f"✅ {rol.value.capitalize()} creado con éxito: {nuevo_usuario.nombre} ({nuevo_usuario.email})")

    finally:
        await session_gen.aclose()


# 🚀 Función principal
async def main():
    # Admin por defecto
    await insertar_usuario(
        nombre="Oscar",
        apellido="Cano",
        email="admin@chargeflow.com",
        password="admin123",
        rol=RolUsuario.ADMIN
    )

    # Técnico por defecto
    await insertar_usuario(
        nombre="Carlos",
        apellido="Ramírez",
        email="tecnico@chargeflow.com",
        password="123456",
        rol=RolUsuario.TECNICO
    )

    # Cliente por defecto
    await insertar_usuario(
        nombre="Juan Alberto",
        apellido="Parra",
        email="jalberto@chargeflow.com",
        password="juan123",
        rol=RolUsuario.CLIENTE
    )


if __name__ == "__main__":
    asyncio.run(main())