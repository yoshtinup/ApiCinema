import { IStorageService } from '../../../Dominio/ports/IStorageService.js';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Implementación del servicio de almacenamiento usando AWS S3
 */
export class S3StorageRepository extends IStorageService {
  constructor() {
    super();
    
    // Configurar cliente S3
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
      }
    };

    // Agregar session token si está presente (para credenciales temporales)
    if (process.env.aws_session_token) {
      config.credentials.sessionToken = process.env.aws_session_token;
    }

    this.s3Client = new S3Client(config);
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'cinesnacks-imagess';
    
    console.log('✅ S3StorageRepository inicializado:', {
      region: config.region,
      bucket: this.bucketName,
      hasSessionToken: !!process.env.aws_session_token
    });
  }

  /**
   * Subir un archivo a S3
   */
  async uploadFile(fileBuffer, fileName, mimeType, folder = '') {
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileKey = folder ? `${folder}/${timestamp}-${sanitizedFileName}` : `${timestamp}-${sanitizedFileName}`;

      // Para archivos grandes (>5MB), usar multipart upload
      if (fileBuffer.length > 5 * 1024 * 1024) {
        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucketName,
            Key: fileKey,
            Body: fileBuffer,
            ContentType: mimeType,
            // ACL: 'public-read' // Descomentar si quieres acceso público directo
          }
        });

        await upload.done();
      } else {
        // Para archivos pequeños, usar PutObjectCommand
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: fileBuffer,
          ContentType: mimeType,
          // ACL: 'public-read' // Descomentar si quieres acceso público directo
        });

        await this.s3Client.send(command);
      }

      // Construir URL pública del archivo
      const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;

      console.log('✅ Archivo subido a S3:', {
        fileName: sanitizedFileName,
        fileKey,
        size: `${(fileBuffer.length / 1024).toFixed(2)} KB`,
        url: fileUrl
      });

      return {
        success: true,
        fileKey,
        fileUrl,
        fileName: sanitizedFileName,
        size: fileBuffer.length,
        mimeType
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo a S3:', error);
      throw new Error(`Error al subir archivo a S3: ${error.message}`);
    }
  }

  /**
   * Eliminar un archivo de S3
   */
  async deleteFile(fileKey) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey
      });

      await this.s3Client.send(command);

      console.log('✅ Archivo eliminado de S3:', fileKey);

      return {
        success: true,
        message: 'Archivo eliminado exitosamente',
        fileKey
      };
    } catch (error) {
      console.error('❌ Error eliminando archivo de S3:', error);
      throw new Error(`Error al eliminar archivo de S3: ${error.message}`);
    }
  }

  /**
   * Obtener URL pública de un archivo
   */
  async getFileUrl(fileKey) {
    const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
    return fileUrl;
  }

  /**
   * Obtener URL firmada temporal (presigned URL)
   */
  async getSignedUrl(fileKey, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      console.log('✅ URL firmada generada:', {
        fileKey,
        expiresIn: `${expiresIn}s`
      });

      return signedUrl;
    } catch (error) {
      console.error('❌ Error generando URL firmada:', error);
      throw new Error(`Error al generar URL firmada: ${error.message}`);
    }
  }
}
