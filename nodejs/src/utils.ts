import {diag} from "@opentelemetry/api";

export function verifyToken(token: string) :string {
    if (token.startsWith('Bearer')) {
        diag.info(
            '\'Bearer\' prefix was attached to the provided cisco-token. We recommend using a "clean" token without the prefix');
        return token;
    } else {
        return `Bearer ${token}`;
    }
}

export function getEnvBoolean(key: string, defaultValue = true) {
    const value = process.env[key];

    if (value === undefined) {
        return defaultValue;
    }

    return ['false'].indexOf(value.trim().toLowerCase()) < 0;
}
