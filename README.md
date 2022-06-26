# cisco-otel-lambda
This package provides Lambda Layers with OpenTelemetry-compliant tracing to AWS Lambda functions for the collection of distributed tracing and performance metrics in Cisco Telescope.

## Getting Started
Make sure to use the layer in the same region as your Lambda functions, as they are regionalized resources, meaning they can only be used in the region in which they are published.

| Runtime | Lambda layer ARN format                                               |
|---------|-----------------------------------------------------------------------|
| Node JS | `arn:aws:lambda:<your-region>:621890419298:layer:cisco-otel-lambda:1` |

Find the supported regions in the table below and replace `<your-region>` in the ARN to consume.

## Supported AWS Regions
| AWS Region | Architecture     |
|------------|------------------|
| us-east-1  | `arm64` `x86_64` |
| us-east-2  | `arm64` `x86_64` |
| eu-west-1  | `arm64` `x86_64` |
| eu-west-2  | `arm64` `x86_64` |

## Supported Runtimes
| Runtime | Supported Version |
|---------|-------------------|
| Node JS | `v16` `v14` `v12` |

## Configuration

| Env                     | -          | Default | Description                              |
|-------------------------|------------|---------|------------------------------------------|
| CISCO_TOKEN             | `required` | -       | Cisco account token                      |
| AWS_LAMBDA_EXEC_WRAPPER | `required` | -       | Value must be set to `/opt/otel-wrapper` |
| OTEL_SERVICE_NAME       | `optional` | AWS_LAMBDA_FUNCTION_NAME | The service name |
| CISCO_DEBUG             | `optional` | `false` | Debug logs                               |

## Getting Help

If you have any issue around using the layer or the product, please don't hesitate to:

- Use the [documentation](https://docs.telescope.app).
- Use the help widget inside the product.
- Open an issue in GitHub.

## Opening Issues

If you encounter a bug with the Cisco OpenTelemetry Lambda Layer, we want to hear about it.

When opening a new issue, please provide as much information about the environment:

- Library version, runtime version, dependencies, etc.
- Output logs.
- A reproducible example can really help.

The GitHub issues are intended for bug reports and feature requests.
For help and questions about [Cisco Telescope](https://console.telescope.app/?utm_source=github), use the help widget inside the product.

## License

Provided under the Apache 2.0. See LICENSE for details.

Copyright 2022, Cisco
