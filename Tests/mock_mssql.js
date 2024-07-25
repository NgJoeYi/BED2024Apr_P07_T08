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
  connect: mockConnect,
  close: jest.fn(),
  request: jest.fn(() => mockRequest),
  Int: 'Int',
  NVarChar: 'NVarChar',
};

module.exports = mockMssql;
