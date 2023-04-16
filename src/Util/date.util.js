import { format } from "date-fns";

export const SERVER_TIMEZONE = 'UTC';
export const DATE_PATTERN = 'yyyy-MM-dd HH:mm:ss.SSS';

/**
 *
 * @returns {string}
 */
export function createUtcDate() {
    process.env.TZ = SERVER_TIMEZONE;

    return format(new Date(), DATE_PATTERN);
}
