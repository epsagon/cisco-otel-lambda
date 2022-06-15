import {diag, DiagConsoleLogger, DiagLogLevel} from '@opentelemetry/api';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { awsLambdaDetector } from '@opentelemetry/resource-detector-aws';
import { detectResources, envDetector, processDetector } from '@opentelemetry/resources';
import { Consts } from 'cisco-opentelemetry-specifications';
import {getEnvBoolean, verifyToken} from './utils';

const debug =
    getEnvBoolean(Consts.CISCO_DEBUG_ENV, Consts.DEFAULT_CISCO_DEBUG);

if(debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

const ciscoToken = process.env[Consts.CISCO_TOKEN_ENV] || '';

if (!ciscoToken) {
    diag.error('Cisco token was not set');
}

const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const instrumentations: any[] =
    getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-aws-lambda': {
            disableAwsContextPropagation: true
        },
    })

async function init() {
    const detectedResources =
        await detectResources({
            detectors: [awsLambdaDetector, envDetector, processDetector]
        });

    const provider = new NodeTracerProvider({
        resource: detectedResources
    });

    const collectorOptions = {
        url: Consts.DEFAULT_COLLECTOR_ENDPOINT,
        headers: {
            authorization: verifyToken(ciscoToken),
        },
    };

    const spanProcessor = new BatchSpanProcessor(new OTLPTraceExporter(collectorOptions));

    provider.addSpanProcessor(spanProcessor);

    provider.register();

    registerInstrumentations({
        instrumentations: instrumentations
    });
}

init();
