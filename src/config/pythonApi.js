import devMode from './env';
// export const pythonApi = 'http://hcigpu01:8023'; // (process.env.NODE_ENV === 'development') ? 'localhost' : '129.206.117.75';
// export const pythonApi = 'http://129.206.117.181:8000'; // HCI GPU01
// export const pythonApi = 'http://129.206.117.193:8023'; // HCI GPU03

export const pythonApi = devMode
  ? 'http://compvis10.iwr.uni-heidelberg.de:8023'
  : 'http://127.0.0.1:8023';

export default pythonApi;
