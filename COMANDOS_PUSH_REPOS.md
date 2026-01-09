# Comandos para Subir Código a los Repositorios

## Backend

```bash
cd S/aplicacionWZC/madres-digitales-backend

# Inicializar git si no existe
git init

# Agregar remote
git remote add origin https://github.com/wzuccardi/madres-digitales-backend.git

# Verificar que no haya otros remotes
git remote -v

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Backend con configuración Vercel lista"

# Subir a main
git branch -M main
git push -u origin main
```

## Frontend

```bash
cd S/aplicacionWZC/madres_digitales_flutter_new

# Inicializar git si no existe
git init

# Agregar remote
git remote add origin https://github.com/wzuccardi/madres-digitales-frontend.git

# Verificar que no haya otros remotes
git remote -v

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Frontend Flutter con configuración Vercel lista"

# Subir a main
git branch -M main
git push -u origin main
```

## Verificación

Después de hacer push, verifica en GitHub que los archivos se subieron correctamente:
- Backend: https://github.com/wzuccardi/madres-digitales-backend
- Frontend: https://github.com/wzuccardi/madres-digitales-frontend

## Siguiente Paso: Configurar Vercel

Una vez que el código esté en GitHub, procede a configurar los proyectos en Vercel según el CHECKLIST_DEPLOYMENT_FINAL.md
