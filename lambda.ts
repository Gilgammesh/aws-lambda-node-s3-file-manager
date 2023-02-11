import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import HTTP_CODES from 'http-status-enum';
import multipart from 'lambda-multipart-parser';
import S3 from './bucket/s3';
import { s3Bucket } from './constants/config';

// Lambda Handler para administrar los archivos del Bucket S3
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Obtenemos un archivo del Bucket S3
  if (event.httpMethod === 'POST') {
    try {
      if (event.queryStringParameters && event.queryStringParameters.repository) {
        if (event.queryStringParameters && event.queryStringParameters.filename) {
          // Obtenemos el repositorio del archivo
          const repository = event.queryStringParameters.repository;
          // Obtenemos el filename del archivo
          const filename = event.queryStringParameters.filename;

          // Obtenemos el archivo
          const file = await S3.getObject({
            Bucket: s3Bucket,
            Key: `${repository}/${filename}`
          }).promise();

          console.log('FileManager', 'POST', 'Se obtuvo el archivo del Bucket S3 correctamente');
          return {
            statusCode: HTTP_CODES.OK,
            body: JSON.stringify({
              success: true,
              message: 'Se obtuvo el archivo del Bucket S3 correctamente',
              file
            })
          };
        } else {
          console.log('FileManager', 'POST', 'Falta el parámetro filename en el query url');
          return {
            statusCode: HTTP_CODES.BAD_REQUEST,
            body: JSON.stringify({
              success: false,
              message: 'Falta el parámetro filename en el query url'
            })
          };
        }
      } else {
        console.log('FileManager', 'POST', 'Falta el parámetro repository en el query url');
        return {
          statusCode: HTTP_CODES.BAD_REQUEST,
          body: JSON.stringify({
            success: false,
            message: 'Falta el parámetro repository en el query url'
          })
        };
      }
    } catch (error) {
      console.log('FileManager', 'POST', error);
      return {
        statusCode: HTTP_CODES.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          success: false,
          message: 'No se pudo obtener el archivo del Bucket S3'
        })
      };
    }
  }

  // Almacenamos los archivos en el Bucket S3
  if (event.httpMethod === 'PUT') {
    try {
      if (event.queryStringParameters && event.queryStringParameters.repository) {
        // Obtenemos el repositorio del archivo
        const repository = event.queryStringParameters.repository;
        // Hacemos un parse del event multipart
        const result = await multipart.parse(event);
        // Obtenemos los archivos
        const files = result.files;
        // Inicializamos nuestro array de errores
        let logs: any[] = [];
        // Recorremos los archivo para almacenarlos en el Bucket
        const promisesPutFiles = files.map(async (file, index) => {
          try {
            console.log('ContentType =>', file.contentType);
            // Almacenamos el archivo
            await S3.putObject({
              Bucket: s3Bucket,
              Key: `${repository}/${file.filename}`,
              Body: file.content,
              ContentType: file.contentType
            }).promise();
          } catch (error) {
            console.log('FileManager', 'PUT', index, file.fieldname, file.filename, error);
            logs.push({
              fieldname: file.fieldname,
              filename: file.filename,
              error
            });
          }
        });
        await Promise.all(promisesPutFiles);
        console.log('FileManager', 'PUT', `Se almacenaron ${files.length - logs.length} archivos`);
        console.log('FileManager', 'PUT', logs);
        return {
          statusCode: HTTP_CODES.OK,
          body: JSON.stringify({
            success: true,
            message: `Se almacenaron ${files.length - logs.length} archivos`,
            logs
          })
        };
      }
      console.log('FileManager', 'PUT', 'Falta el parámetro repository en el query url');
      return {
        statusCode: HTTP_CODES.BAD_REQUEST,
        body: JSON.stringify({
          success: false,
          message: 'Falta el parámetro repository en el query url'
        })
      };
    } catch (error) {
      console.log('FileManager', 'PUT', error);
      return {
        statusCode: HTTP_CODES.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          success: false,
          message: 'No se pudieron almacenar los archivos en el Bucket S3'
        })
      };
    }
  }

  // Obtenemos la url de un archivo del Bucket S3
  if (event.httpMethod === 'GET') {
    try {
      if (event.queryStringParameters && event.queryStringParameters.repository) {
        if (event.queryStringParameters && event.queryStringParameters.filename) {
          // Obtenemos el repositorio del archivo
          const repository = event.queryStringParameters.repository;
          // Obtenemos el filename del archivo
          const filename = event.queryStringParameters.filename;

          // Obtenemos la url del archivo
          const url = S3.getSignedUrl('getObject', {
            Bucket: s3Bucket,
            Key: `${repository}/${filename}`
          });

          console.log('FileManager', 'GET', 'Se obtuvo la url del archivo correctamente');
          return {
            statusCode: HTTP_CODES.OK,
            body: JSON.stringify({
              success: true,
              message: 'Se obtuvo la url del archivo correctamente',
              url
            })
          };
        } else {
          console.log('FileManager', 'GET', 'Falta el parámetro filename en el query url');
          return {
            statusCode: HTTP_CODES.BAD_REQUEST,
            body: JSON.stringify({
              success: false,
              message: 'Falta el parámetro filename en el query url'
            })
          };
        }
      } else {
        console.log('FileManager', 'GET', 'Falta el parámetro repository en el query url');
        return {
          statusCode: HTTP_CODES.BAD_REQUEST,
          body: JSON.stringify({
            success: false,
            message: 'Falta el parámetro repository en el query url'
          })
        };
      }
    } catch (error) {
      console.log('FileManager', 'GET', error);
      return {
        statusCode: HTTP_CODES.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          success: false,
          message: 'No se pudo obtener la url del archivo'
        })
      };
    }
  }

  // Eliminamos un archivo del Bucket S3
  if (event.httpMethod === 'DELETE') {
    try {
      if (event.queryStringParameters && event.queryStringParameters.repository) {
        if (event.queryStringParameters && event.queryStringParameters.filename) {
          // Obtenemos el repositorio del archivo
          const repository = event.queryStringParameters.repository;
          // Obtenemos el filename del archivo
          const filename = event.queryStringParameters.filename;

          // Eliminar el archivo
          await S3.deleteObject({
            Bucket: s3Bucket,
            Key: `${repository}/${filename}`
          }).promise();

          console.log('FileManager', 'DELETE', 'Se eliminó el archivo del Bucket S3 correctamente');
          return {
            statusCode: HTTP_CODES.OK,
            body: JSON.stringify({
              success: true,
              message: 'Se eliminó el archivo del Bucket S3 correctamente'
            })
          };
        } else {
          console.log('FileManager', 'DELETE', 'Falta el parámetro filename en el query url');
          return {
            statusCode: HTTP_CODES.BAD_REQUEST,
            body: JSON.stringify({
              success: false,
              message: 'Falta el parámetro filename en el query url'
            })
          };
        }
      } else {
        console.log('FileManager', 'DELETE', 'Falta el parámetro repository en el query url');
        return {
          statusCode: HTTP_CODES.BAD_REQUEST,
          body: JSON.stringify({
            success: false,
            message: 'Falta el parámetro repository en el query url'
          })
        };
      }
    } catch (error) {
      console.log('FileManager', 'DELETE', error);
      return {
        statusCode: HTTP_CODES.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({
          success: false,
          message: 'No se pudo eliminar el archivo del Bucket S3'
        })
      };
    }
  }

  return {
    statusCode: HTTP_CODES.BAD_REQUEST,
    body: JSON.stringify({
      success: false,
      message: `El método ${event.httpMethod} no está disponible`
    })
  };
};
