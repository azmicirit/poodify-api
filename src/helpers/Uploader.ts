import * as S3 from 'aws-sdk/clients/s3';
import Validator from '../utils/Validator';

export enum FOLDERS {
  COMPANY = 'company',
  DRIVER = 'driver',
}

export default class Uploader {
  private s3Client;

  constructor() {
    this.s3Client = new S3();
  }

  private ConvertBase64(data: string): Buffer {
    data = data.indexOf(',') > -1 ? data.split(',')[1]: data;
    return Buffer.from(data, 'base64');
  }

  private GetContentType(data: string): string {
    return data.split(';')[0].split(':')[1];
  }

  private GetFileExtension(contentType: string) {
    let result = null;

    switch (contentType) {
      case 'image/png':
        result = 'png';
        break;
      case 'image/jpeg':
        result = 'jpg';
        break;
      case 'image/jpg':
        result = 'jpg';
        break;
      default:
        result = null;
        break;
    }

    return result;
  }

  async Upload(folder: FOLDERS, fileName: string, buffer: any, isPublic?: boolean, contentEncoding?: string | 'base64', contentType?: string): Promise<string> | null {
    try {
      if (Validator.IsHTTPURL(buffer)) return buffer; // CHECK IF IT IS AN URL

      contentType = contentEncoding === 'base64' ? this.GetContentType(buffer) : contentType || null;
      buffer = contentEncoding === 'base64' ? this.ConvertBase64(buffer) : buffer;

      const bucket = process.env.S3_BUCKET;
      const extension = this.GetFileExtension(contentType);
      const key = `${folder}/${extension ? `${fileName}.${extension}` : fileName}`;
      const result = await this.s3Client
        .putObject({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          Tagging: `public=${isPublic ? 'yes' : 'no'}`,
          ContentEncoding: contentEncoding || undefined,
          ContentType: contentType || undefined,
        })
        .promise();

      if (result?.$response?.error) {
        return null;
      } else {
        return await this.s3Client.getSignedUrl('getObject', { Bucket: bucket, Key: key })?.split('?')?.[0];
      }
    } catch (error) {
      console.log(`Uploader.Upload Error ${error.toString()}`);
      return null;
    }
  }
}
