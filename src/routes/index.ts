import storageRoute from './storage-route';

const basePath = '/api/v1';


export const routes = [
    { path: `${basePath}/s3`, handler: storageRoute },
];
