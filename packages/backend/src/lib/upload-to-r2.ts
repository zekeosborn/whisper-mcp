import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const {
	R2_ENDPOINT: endpoint,
	R2_ACCESS_KEY_ID: accessKeyId,
	R2_SECRET_ACCESS_KEY: secretAccessKey,
	R2_BUCKET_NAME: bucketName
} = process.env;

if (!endpoint || !accessKeyId || !secretAccessKey) {
	throw new Error("Missing required environment variables for R2.");
}

// Initialize S3 client
const s3 = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey},
});

export default async function uploadToR2(
	key: string,
	body: Buffer,
	contentType: string
) {
	if (!bucketName) {
		throw new Error("Missing R2_BUCKET_NAME environment variable.");
	}

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: key,
		Body: body,
		ContentType: contentType,
	});

	await s3.send(command);
}