import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { BatchSpanProcessor, SDKRegistrationConfig } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { awsLambdaDetector } from '@opentelemetry/resource-detector-aws';
import { detectResources, envDetector, processDetector } from '@opentelemetry/resources';
import { CompositePropagator, W3CTraceContextPropagator } from "@opentelemetry/core";
import { AWSXRayPropagator } from "@opentelemetry/propagator-aws-xray";
import { B3InjectEncoding, B3Propagator } from "@opentelemetry/propagator-b3";
import { AWSXRayIdGenerator } from "@opentelemetry/id-generator-aws-xray";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const instrumentations: any[] = getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true
    },
})

async function init() {
    console.log('enter init');
    const resource =
        await detectResources({
            detectors: [awsLambdaDetector, envDetector, processDetector]
        });

    console.log('define NodeTracerProvider');
    const provider = new NodeTracerProvider({
        resource,
        idGenerator: new AWSXRayIdGenerator()
    });

    console.log('define collector');
    const collectorOptions = {
        url: 'https://collector.lambda.lupaproject.io/v1/traces',
    };

    const spanProcessor = new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions));

    provider.addSpanProcessor(spanProcessor);

    let sdkRegistrationConfig: SDKRegistrationConfig = {};

    if (!process.env.OTEL_PROPAGATORS) {
        console.log('OTEL_PROPAGATORS exist');
        sdkRegistrationConfig =
            {
                propagator:  new CompositePropagator({
                    propagators: [
                        new AWSXRayPropagator(),
                        new W3CTraceContextPropagator(),
                        new B3Propagator(),
                        new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
                    ],
                }),
            };
    }

    provider.register(sdkRegistrationConfig);
    
    console.log('registerInstrumentations');
    registerInstrumentations({
        instrumentations: instrumentations
    });
    console.log('after register');
}


try {
    console.log('before init');
    init();
} catch (error) {
    console.log(error);
}

