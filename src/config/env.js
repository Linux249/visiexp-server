// stuff that changes through env

//export const mockDataLength = 2400;

export const devMode = (process.env.NODE_ENV === 'development');

export default devMode;
