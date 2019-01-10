// stuff that changes through env

export const pythonApi = (process.env.NODE_ENV === 'development') ? 'localhost' : '129.206.117.172';

export const mockDataLength = 250;
