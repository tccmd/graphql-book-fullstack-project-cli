// 환경변수
import 'dotenv/config'
// @aws-sdk
import { ObjectCannedACL, S3Client } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';
// graphql-upload-ts
import { FileUpload } from "graphql-upload-ts";

// s3 sdk setting 환경변수를 이용해 bucket, region, key 셋팅
const Bucket = process.env.AWS_S3_BUCKET_NAME;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

// 파일 객체를 받아서 이미지 업로드
export async function uploadImage(file: FileUpload) {
  // 디버깅 로그 - 환경변수
  // console.log('AWS_REGION:', process.env.AWS_REGION);
  // console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
  // console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
  // console.log('S3 Bucket Name:', process.env.AWS_S3_BUCKET_NAME);
  // console.log('util_uploadImage_file: ', file);

  // S3 업로드 파라미터 설정 // fild: FileUpload의 스트림이 사용됨
  const uploadParams = {
    Bucket,
    Key: `public/${file.filename}`,  // 파일이 저장될 S3 경로 (예: profile-images/파일명)
    Body: file.createReadStream(),  // 파일 스트림
    ContentType: file.mimetype,  // 파일의 MIME 타입
    ACL: ObjectCannedACL.public_read,  // 공개 읽기 권한 설정
  };

  // 디버깅 로그 - 업로드 파라미터
  console.log('s3upload_uploadParams: ', uploadParams);

  // 업로드 시행
  try {
    // Upload 객체 생성 (s3 client, upload parameter)
    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    // 업로드 함수 실행
    await upload.done();
    
    // 업로드 후, 파일의 URL 반환
    return `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (err) {
    // 업로드 시행 실패 시 에러 발행
    console.error('Error uploading file to S3:', err);
    throw new Error(`File upload failed: ${err.message || 'Unknown error'}`);
  }
}