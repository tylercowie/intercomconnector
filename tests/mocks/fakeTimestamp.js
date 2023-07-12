import {faker} from '@faker-js/faker';

export const fakeTimestamp = () => faker.date.recent().getTime() / 1000;
