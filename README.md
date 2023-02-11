# AWS Serverless Lambda - S3 File Manager

Función Lambda para administrar los archivos o documentos almacenados en S3.

## Consideraciones Previas

Necesitaremos tener instaladas en nuestra máquina local:

> **Nodejs**: versión 16.X (de preferencia la versión LTS Gallium 16.17.1)

> **Serverless**: Framework Core versión 3.2 ó superior y SDK versión 4.3 ó superior

## Instalación

Instalar dependencias del proyecto y de desarrollo:

```sh
npm install
```

```sh
npm install -D
```

## Despliegue

Ejecutamos el script

```sh
npm run deploy
```

Que es equivalente al script

```sh
serverless deploy
```

## Plugins

> **serverless-plugin-typescript**: Soporte de typescript para lambdas

> **serverless-offline**: Emulador local para lambdas

> **serverless-prune-plugin**: Eliminar versiones antiguas
