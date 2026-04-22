import boto3, os
from uuid import uuid4
from dotenv import load_dotenv

load_dotenv()

BUCKET = os.getenv("AWS_BUCKET_NAME")

def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )

def upload_file_to_s3(user_id: str, folder_id: str | None, file_obj, filename):

    s3 = get_s3_client()
    bucket = BUCKET
    prefix = f"{user_id}/"

    if folder_id:
        prefix += f"{folder_id}/"


    unique_name = f"{prefix}{uuid4()}_{filename}"
    s3.upload_fileobj(file_obj, bucket, unique_name)

    return unique_name


def gen_presigned_url(object_key: str, expiration: int = 3600):
    
    s3 = get_s3_client()

    bucket = BUCKET

    url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket,
            "Key": object_key
        },

        ExpiresIn = expiration
    )

    return url