import storageRoute from './storage-route';

import googleDriveRoute from './google-drive-route';

const basePath = '/api/v1';


export const routes = [
    { path: `${basePath}/s3`, handler: storageRoute },
    { path: `${basePath}/bucket`, handler: googleDriveRoute },
];
