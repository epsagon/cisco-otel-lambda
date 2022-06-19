#!/bin/sh

BASE_SPACE=$(pwd)
BUILD_SPACE=$BASE_SPACE/build
BUCKET_NAME=otel-telescope-layer
LAYER_NAME=cisco-otel-lambda
REGION=("us-east-1" "us-east-2")

for REGION in "${REGION[@]}"
do
    echo Publishing Telescope NodeJS layer to ${REGION}...
    aws s3 mb s3://${BUCKET_NAME} --region ${REGION}
    aws s3 cp ${BUILD_SPACE}/${LAYER_NAME}.zip s3://${BUCKET_NAME} --region ${REGION}
    aws lambda publish-layer-version --layer-name ${LAYER_NAME} --content S3Bucket=${BUCKET_NAME},S3Key=${LAYER_NAME}.zip --compatible-runtimes nodejs16.x nodejs14.x nodejs12.x nodejs10.x nodejs8.10 --compatible-architectures "arm64" "x86_64" --license-info MIT --query 'LayerVersionArn' --output text --region ${REGION}
    echo Clearing cached files...
    aws s3 rm s3://${BUCKET_NAME}/${LAYER_NAME}.zip --${REGION}
    aws s3 rb s3://${BUCKET_NAME} --${REGION}
    echo Telescope layer published tp ${REGION}.
done
