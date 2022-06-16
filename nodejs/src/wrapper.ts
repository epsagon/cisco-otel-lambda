import {diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import {BatchSpanProcessor, SDKRegistrationConfig} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { awsLambdaDetector } from '@opentelemetry/resource-detector-aws';
import { detectResources, envDetector, processDetector } from '@opentelemetry/resources';
import { Consts } from 'cisco-opentelemetry-specifications';
import {getEnvBoolean, verifyToken} from './utils';
import {CompositePropagator, W3CTraceContextPropagator} from "@opentelemetry/core";
import {AWSXRayPropagator} from "@opentelemetry/propagator-aws-xray";
import {B3InjectEncoding, B3Propagator} from "@opentelemetry/propagator-b3";
import {AWSXRayIdGenerator} from "@opentelemetry/id-generator-aws-xray";

const debug =
    getEnvBoolean(Consts.CISCO_DEBUG_ENV, Consts.DEFAULT_CISCO_DEBUG);

if(debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const instrumentations: any[] = getNodeAutoInstrumentations()

async function init() {
    const resource =
        await detectResources({
            detectors: [awsLambdaDetector, envDetector, processDetector]
        });

    const provider = new NodeTracerProvider({
        resource,
        idGenerator: new AWSXRayIdGenerator()
    });

    const collectorOptions = {
        url: Consts.DEFAULT_COLLECTOR_ENDPOINT,
        headers: {
            authorization: verifyToken(ciscoToken),
        },
    };

    const spanProcessor = new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions));

    provider.addSpanProcessor(spanProcessor);

    let sdkRegistrationConfig: SDKRegistrationConfig = {};

    if (!process.env.OTEL_PROPAGATORS) {
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

    registerInstrumentations({
        instrumentations: instrumentations
    });
}

const ciscoToken = process.env[Consts.CISCO_TOKEN_ENV] || '';

if (ciscoToken) {
    init();
} else {
    diag.error('Cisco token was not found in the environment variables');
}

