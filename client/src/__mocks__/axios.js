// client/src/__mocks__/axios.js

const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: { headers: { common: {} } },
    interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
    },
};

const mockCreate = jest.fn(() => mockAxiosInstance);

const axiosMock = {
    create: mockCreate,
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: {
        headers: {
            common: {},
            post: {},
            get: {},
        },
    },
    __mockAxiosInstance: mockAxiosInstance,
    __mockCreateFn: mockCreate,
};

export default axiosMock;
export const create = mockCreate;
