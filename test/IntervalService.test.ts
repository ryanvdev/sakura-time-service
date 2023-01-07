import { TimeZoneId } from 'timezone-ids';
import { sleep, IntervalService } from '../lib';

describe('IntervalService', () => {
    const currentTime = new Date();
    const timeZoneId: TimeZoneId = 'America/New_York';
    const formatTime = Intl.DateTimeFormat('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timeZoneId,
    });

    test('times', async () => {
        const logs: string[] = [];
        let isError: boolean = false;
        let couter: number = 0;

        const autoLogService = new IntervalService({
            callback: (e) => {
                couter++;
                logs.push(formatTime.format(new Date()));
                // console.log('current couter =', couter);

                if (couter === 2) {
                    throw new Error('ERROR......');
                }

                if (couter === 3) {
                    e.currentTarget.delay = 200;
                }

                if (couter >= 10) {
                    e.currentTarget.stop();
                }
            },
            delay: 1000,
        });

        autoLogService.onError = () => {
            isError = true;
        };

        autoLogService.start();

        const firstStatus = autoLogService.status;
        await sleep(5_000);
        const endStatus = autoLogService.status;

        // console.log(formatTime.format(currentTime), formatTime.format(new Date()));
        // console.log('autoLogService.status', autoLogService.status);
        // console.log('couter', couter);

        autoLogService.stop();

        // expect()
        expect(
            firstStatus === 'running' &&
                endStatus === 'stopped' &&
                autoLogService.delay === 200 &&
                logs.length === 10,
        ).toBe(true);
    });
});
