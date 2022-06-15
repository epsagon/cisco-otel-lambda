"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@opentelemetry/api");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const resource_detector_aws_1 = require("@opentelemetry/resource-detector-aws");
const resources_1 = require("@opentelemetry/resources");
const core_1 = require("@opentelemetry/core");
const utils_1 = require("./utils.d.ts");
const logLevel = (0, core_1.getEnv)().OTEL_LOG_LEVEL;
api_1.diag.setLogger(new api_1.DiagConsoleLogger(), logLevel);
const ciscoToken = process.env["CISCO_TOKEN"] || '';
if (!ciscoToken) {
    api_1.diag.error('Cisco token was not set');
}
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const instrumentations = getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-aws-lambda': {
        disableAwsContextPropagation: true
    },
});
async function init() {
    const detectedResources = await (0, resources_1.detectResources)({
        detectors: [resource_detector_aws_1.awsLambdaDetector, resources_1.envDetector, resources_1.processDetector]
    });
    const provider = new sdk_trace_node_1.NodeTracerProvider({
        resource: detectedResources
    });
    const collectorOptions = {
        url: 'https://production.cisco-udp.com/trace-collector',
        headers: {
            authorization: (0, utils_1.verifyToken)(ciscoToken),
        },
    };
    const spanProcessor = new sdk_trace_base_1.BatchSpanProcessor(new exporter_trace_otlp_http_1.OTLPTraceExporter(collectorOptions));
    provider.addSpanProcessor(spanProcessor);
    provider.register();
    (0, instrumentation_1.registerInstrumentations)({
        instrumentations: instrumentations
    });
}
init();
//# sourceMappingURL=wrapper.js.map
