const mockQuery = jest.fn();
const mockInput = jest.fn().mockReturnThis();
const mockRequest = {
  query: mockQuery,
  input: mockInput,
};

const mockConnect = jest.fn().mockResolvedValue({
  request: jest.fn(() => mockRequest),
  close: jest.fn(),
});

const mockMssql = {
  connect: jest.fn().mockResolvedValue({
      request: jest.fn().mockReturnThis(),
      close: jest.fn(),
      query: jest.fn(),
      Int: 'Int',
      NVarChar: 'NVarChar',
  }),
};

jest.mock('mssql', () => mockMssql);


module.exports = mockMssql;
