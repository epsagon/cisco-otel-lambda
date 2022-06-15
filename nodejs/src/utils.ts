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
