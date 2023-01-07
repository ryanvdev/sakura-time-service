import { TimeZoneId } from 'timezone-ids';
import { RegularService, sleep } from '../lib';
import { deepCompare } from 'ufer-object';

describe('RegularService', () => {
    const currentTime = new Date();
    const timeZoneId: TimeZoneId = 'America/New_York';

    const formatTime = (d: Date) => {
        return d.toLocaleTimeString('ja-JP', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const generateTime = (i: number) => {
        const tmpDate = new Date(currentTime.getTime() + 1000 * i);
        return formatTime(tmpDate);
    };

    test('times', async () => {
        const times: string[] = [];
        const n: number = 5;

        for (let i = 0; i < n; i++) {
            times.push(generateTime(i + 1));
        }

        const logs: string[] = [];
        let times2: string[] = [];
        let enable: boolean = true;
        let errorLog: string = '';

        const autoLogService = new RegularService({
            times,
            callback: async (e) => {
                const tmp = formatTime(new Date());
                logs.push(tmp);

                if (enable && tmp === e.currentTarget.times.at(-2)) {
                    enable = false;

                    times2.push(generateTime(n + 3));
                    times2.push(generateTime(n + 4));
                    times2.push(generateTime(n + 5));
                    times2.push(generateTime(n + 6));

                    e.currentTarget.setTimes([...times2]);
                }

                if (!enable && tmp === e.currentTarget.times[1]) {
                    throw new Error('Error...');
                }

                if (!enable && tmp === e.currentTarget.times.at(-1)) {
                    e.currentTarget.stop();
                }
            },
            timeZone: timeZoneId,
        });

        autoLogService.onError = () => {
            errorLog = formatTime(new Date());
        };

        autoLogService.start();
        const firstStatus = autoLogService.status;

        await sleep(15_000);

        // console.log('', times, '\n' , logs);

        expect(
            deepCompare([...times.slice(0, -1), ...times2], logs) &&
                autoLogService.status === 'stopped' &&
                firstStatus === 'running' &&
                errorLog === times2[1],
        ).toBe(true);
    });
});
