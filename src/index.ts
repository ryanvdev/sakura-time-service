import { TimeZoneId, isValidTimeZoneId } from 'timezone-ids';

export type SakuraTimeServiceStatus = 'running' | 'stopped';

export function sleep(t: number): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof t !== 'number' || !isFinite(t) || Math.round(t) <= 0) {
            reject(new Error('[sleep] sleep-time must be greater than 0'));
        }

        setTimeout(() => {
            resolve();
        }, Math.round(t));
    });
}

export type SakuraTimeServiceHandleError<T> =
    | ((e: { error: unknown; currentTarget: T }) => any)
    | undefined;

export type SakuraTimeServiceCallback<T> = (e: { currentTarget: T }) => any;

abstract class SakuraTimeService<T> {
    protected _timerId: number | undefined | NodeJS.Timer = undefined;
    protected _delay: number = 1000;
    protected abstract _callback: SakuraTimeServiceCallback<T>;
    protected _handleError: SakuraTimeServiceHandleError<T> = undefined;

    public get status(): SakuraTimeServiceStatus {
        if (this._timerId === undefined) {
            return 'stopped';
        }

        return 'running';
    }

    public set onError(handleError: SakuraTimeServiceHandleError<T>) {
        this._handleError = handleError;
    }

    public start(): boolean {
        if (this._timerId !== undefined) return false;

        this._timerId = setInterval(this.run, this._delay);

        // console.log('Started!');
        return true;
    }

    public stop(): boolean {
        if (this._timerId === undefined) return false;

        clearInterval(this._timerId);
        this._timerId = undefined;

        // console.log('Stopped!');
        return true;
    }

    public restart() {
        this.stop();
        this.start();
    }

    protected abstract run: () => Promise<void>;
}

// @audit-info RegularService

export interface RegularServiceProps {
    callback: SakuraTimeServiceCallback<RegularService>;
    times: string[] | Readonly<string[]>;
    timeZone?: TimeZoneId;
}

export class RegularService extends SakuraTimeService<RegularService> {
    private _timeZone: TimeZoneId | undefined = undefined;
    private _times: Readonly<string[]> = [];
    protected _callback: SakuraTimeServiceCallback<RegularService>;

    public get timeZone() {
        return this._timeZone;
    }

    public set timeZone(e: TimeZoneId | undefined | null) {
        if (e === undefined || e === null) {
            this._timeZone = undefined;
            return;
        }

        if (!isValidTimeZoneId(e)) {
            throw new Error(`[RegularService] Invalid timeZone`);
        }

        this._timeZone = e;
    }

    public get times() {
        return this._times;
    }

    public constructor(props: RegularServiceProps) {
        super();
        this._delay = 1000;
        this._callback = props.callback;
        this.timeZone = props.timeZone;
        this.setTimes(props.times);
    }

    public setTimes(e: string[] | Readonly<string[]>) {
        // 23:29:16
        // 0:0:0
        const memoTimes: string[] = [];

        for (const tTime of e) {
            if (typeof tTime !== 'string') {
                throw new Error(
                    `[RegularService] Invalid times - '${tTime}' must have the format: hh:mm:ss`,
                );
            }

            if (tTime.length < 6) {
                throw new Error(
                    `[RegularService] Invalid times - '${tTime}' must have the format: hh:mm:ss`,
                );
            }

            const splitedTtime = tTime.split(':').map((item) => item.trim());
            if (splitedTtime.length !== 3) {
                throw new Error(
                    `[RegularService] Invalid times - '${tTime}' must have the format: hh:mm:ss`,
                );
            }

            const [h, m, s] = splitedTtime.map((n) => parseInt(n));
            if (!isFinite(h) || !isFinite(m) || !isFinite(s)) {
                throw new Error(
                    `[RegularService] Invalid times - '${tTime}' must have the format: hh:mm:ss`,
                );
            }

            if (h < 0 || h >= 24 || m < 0 || m >= 60 || s < 0 || s >= 60) {
                throw new Error(
                    `[RegularService] Invalid times - '${tTime}' must have the format: hh:mm:ss`,
                );
            }

            const strHour = h.toString().padStart(2, '0');
            const strMinute = m.toString().padStart(2, '0');
            const strSecond = s.toString().padStart(2, '0');

            memoTimes.push(`${strHour}:${strMinute}:${strSecond}`);
        }

        memoTimes.sort();
        this._times = Object.freeze(memoTimes);
    }

    protected generateStrCurrentTime = (): string => {
        return new Date().toLocaleTimeString('ja-JP', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    protected run = async (): Promise<void> => {
        const strCurrentTime = this.generateStrCurrentTime();
        if (this._times.includes(strCurrentTime) === false) {
            return;
        }

        try {
            await this._callback({
                currentTarget: this,
            });
        } catch (error) {
            if (this._handleError) {
                this._handleError({
                    currentTarget: this,
                    error,
                });
            } else {
                console.error(error);
            }
        }
    };
}

// @audit-info IntervalService

export interface IntervalServiceProps {
    callback: SakuraTimeServiceCallback<IntervalService>;
    delay?: number;
}

export class IntervalService extends SakuraTimeService<IntervalService> {
    protected _callback: SakuraTimeServiceCallback<IntervalService>;

    public get delay(): number {
        return this._delay;
    }

    public set delay(value: number) {
        if (typeof value !== 'number' || !isFinite(value) || Math.round(value) <= 0) {
            throw new Error('[IntervalService] Invalid delay');
        }

        this._delay = Math.round(value);

        if (this._timerId === undefined) return;

        // restart service....
        this.restart();
    }

    public constructor(props: IntervalServiceProps) {
        super();
        this._timerId = undefined;
        this.delay = props.delay || 1000;
        this._callback = props.callback;
    }

    protected run = async (): Promise<void> => {
        try {
            await this._callback({
                currentTarget: this,
            });
        } catch (error) {
            if (this._handleError) {
                this._handleError({
                    error: error,
                    currentTarget: this,
                });
            } else {
                console.error(error);
            }
        }
    };
}
