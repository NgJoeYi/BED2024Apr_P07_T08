const User = require("../../models/User");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("User.getUserById", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockRestore(); // Restore console.error after each test
  });

  it("should retrieve a user by ID from the database", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      dob: "1990-01-01",
      email: "test@example.com",
      password: "hashedpassword",
      role: "user",
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [mockUser] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const user = await User.getUserById(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(1);
    expect(user.email).toBe("test@example.com");
    // Add more assertions as needed
  });

  it("should return null if no user is found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const user = await User.getUserById(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(user).toBeNull();
  });

  it("should handle errors when retrieving user by ID", async () => {
    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(User.getUserById(1)).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith('Error retrieving a user:', expect.any(Error));
  });
});




// -------------------------------------------------------------------------------------------------------------------------



describe("User.createUser", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockRestore(); // Restore console.error after each test
  });

  it("should create a new user and return it", async () => {
    const newUserData = {
      name: "Jane Doe",
      dob: "1992-02-02",
      email: "jane@example.com",
      password: "newhashedpassword",
      role: "admin",
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [1],
        recordset: [{ id: 1, ...newUserData }],
      }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const user = await User.createUser(newUserData);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(1);
    expect(user.email).toBe(newUserData.email);
    expect(user.password).toBe(newUserData.password);
    // Add more assertions as needed
  });

  it("should throw an error if no rows are affected", async () => {
    const newUserData = {
      name: "Jane Doe",
      dob: "1992-02-02",
      email: "jane@example.com",
      password: "newhashedpassword",
      role: "admin",
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [0],
        recordset: [],
      }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    await expect(User.createUser(newUserData)).rejects.toThrow("User not created");
  });

  it("should handle errors when creating a user", async () => {
    const newUserData = {
      name: "Jane Doe",
      dob: "1992-02-02",
      email: "jane@example.com",
      password: "newhashedpassword",
      role: "admin",
    };

    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(User.createUser(newUserData)).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith('Error creating user:', expect.any(Error));
  });
});






// -------------------------------------------------------------------------------------------------------------------------


describe("User.getUserByEmail", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockRestore(); // Restore console.error after each test
  });

  it("should retrieve a user by email from the database", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      dob: "1990-01-01",
      email: "test@example.com",
      password: "hashedpassword",
      role: "user",
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [mockUser] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const user = await User.getUserByEmail("test@example.com");

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(user).toBeInstanceOf(User);
    expect(user.email).toBe("test@example.com");
    expect(user.password).toBe("hashedpassword");
    // Add more assertions as needed
  });

  it("should handle errors when retrieving user by email", async () => {
    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(User.getUserByEmail("test@example.com")).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith('Error during login:', expect.any(Error));
  });
});



// -------------------------------------------------------------------------------------------------------------------------



describe("User.updateUser", () => {
    let consoleError;
  
    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
      jest.clearAllMocks();
    });
  
    afterEach(() => {
      consoleError.mockRestore(); // Restore console.error after each test
    });
  
    it("should update user data and return the updated user", async () => {
      const userId = 1;
      const newUserData = {
        name: "Jane Doe",
        dob: "1992-02-02",
        email: "jane@example.com",
        password: "newhashedpassword",
      };
  
      const mockUpdatedUser = {
        id: userId,
        name: newUserData.name,
        dob: newUserData.dob,
        email: newUserData.email,
        password: newUserData.password,
      };
  
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      // Mocking the getUserById method to return the updated user
      jest.spyOn(User, 'getUserById').mockResolvedValue(mockUpdatedUser);
  
      const user = await User.updateUser(userId, newUserData);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toBe(newUserData.email);
      expect(user.password).toBe(newUserData.password);
    });
  
    it("should return null if no rows are affected", async () => {
      const userId = 1;
      const newUserData = {
        name: "Jane Doe",
        dob: "1992-02-02",
        email: "jane@example.com",
        password: "newhashedpassword",
      };
  
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const user = await User.updateUser(userId, newUserData);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(user).toBeNull();
    });
  
    it("should handle errors when updating user", async () => {
      const userId = 1;
      const newUserData = {
        name: "Jane Doe",
        dob: "1992-02-02",
        email: "jane@example.com",
        password: "newhashedpassword",
      };
  
      const errorMessage = "Database Error";
      sql.connect.mockRejectedValue(new Error(errorMessage));
  
      await expect(User.updateUser(userId, newUserData)).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Error updating user:', expect.any(Error));
    });
  });
  


  // -------------------------------------------------------------------------------------------------------------------------



  describe("User.deleteUser", () => {
    let consoleError;
  
    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
      jest.clearAllMocks();
    });
  
    afterEach(() => {
      consoleError.mockRestore(); // Restore console.error after each test
    });
  
    it("should delete a user and return true", async () => {
      const userId = 1;
  
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.deleteUser(userId);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  
    it("should return null if no rows are affected", async () => {
      const userId = 1;
  
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] }),
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.deleteUser(userId);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  
    it("should handle errors when deleting a user", async () => {
      const userId = 1;
      const errorMessage = "Database Error";
  
      sql.connect.mockRejectedValue(new Error(errorMessage));
  
      await expect(User.deleteUser(userId)).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));
    });
  });
  


// -------------------------------------------------------------------------------------------------------------------------


describe("User.deleteUtility", () => {
    let consoleError;
  
    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
      jest.clearAllMocks();
    });
  
    afterEach(() => {
      consoleError.mockRestore(); // Restore console.error after each test
    });
  
    it("should drop foreign key constraints and return true", async () => {
      const mockRequest = {
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }), // Simulate that constraints were dropped
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.deleteUtility();
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  
    it("should return false if no constraints were dropped", async () => {
      const mockRequest = {
        query: jest.fn().mockResolvedValue({ rowsAffected: [] }), // Simulate that no constraints were dropped
      };
      const mockConnection = {
        request: jest.fn().mockReturnValue(mockRequest),
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.deleteUtility();
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  
    it("should handle errors when deleting foreign keys", async () => {
      const errorMessage = "Database Error";
      sql.connect.mockRejectedValue(new Error(errorMessage));
  
      await expect(User.deleteUtility()).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Error deleting user-related records:', expect.any(Error));
    });
  });
  



// -------------------------------------------------------------------------------------------------------------------------


describe("User.updateProfilePic", () => {
    let consoleError;
  
    beforeEach(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
      jest.clearAllMocks();
    });
  
    afterEach(() => {
      consoleError.mockRestore(); // Restore console.error after each test
    });
  
    it("should update an existing profile picture and return the updated details", async () => {
      const userId = 1;
      const profilePic = "newBase64ImageString";
  
      const checkQuery = `SELECT * FROM ProfilePic WHERE user_id = @userId`;
      const mockCheckRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ user_id: userId, img: "oldBase64ImageString" }] }),
      };
      const mockUpdateRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
      };
      const mockConnection = {
        request: jest.fn()
          .mockImplementationOnce(() => mockCheckRequest) // Mock the check request
          .mockImplementationOnce(() => mockUpdateRequest), // Mock the update request
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.updateProfilePic(userId, profilePic);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(mockCheckRequest.query).toHaveBeenCalledWith(checkQuery);
      expect(mockUpdateRequest.query).toHaveBeenCalledWith('UPDATE ProfilePic SET img = @profilePic WHERE user_id = @userId');
      expect(result).toEqual({ userId, profilePic });
    });
  
    it("should insert a new profile picture if none exists and return the details", async () => {
      const userId = 2;
      const profilePic = "newBase64ImageString";
  
      const checkQuery = `SELECT * FROM ProfilePic WHERE user_id = @userId`;
      const mockCheckRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] }), // No existing profile picture
      };
      const mockInsertRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
      };
      const mockConnection = {
        request: jest.fn()
          .mockImplementationOnce(() => mockCheckRequest) // Mock the check request
          .mockImplementationOnce(() => mockInsertRequest), // Mock the insert request
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.updateProfilePic(userId, profilePic);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(mockCheckRequest.query).toHaveBeenCalledWith(checkQuery);
      expect(mockInsertRequest.query).toHaveBeenCalledWith('INSERT INTO ProfilePic (user_id, img) VALUES (@userId, @profilePic)');
      expect(result).toEqual({ userId, profilePic });
    });
  
    it("should return null if no rows are affected", async () => {
      const userId = 3;
      const profilePic = "newBase64ImageString";
  
      const checkQuery = `SELECT * FROM ProfilePic WHERE user_id = @userId`;
      const mockCheckRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [{ user_id: userId, img: "oldBase64ImageString" }] }),
      };
      const mockUpdateRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [0] }), // No rows affected
      };
      const mockConnection = {
        request: jest.fn()
          .mockImplementationOnce(() => mockCheckRequest) // Mock the check request
          .mockImplementationOnce(() => mockUpdateRequest), // Mock the update request
        close: jest.fn().mockResolvedValue(undefined),
      };
  
      sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
      const result = await User.updateProfilePic(userId, profilePic);
  
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
      expect(mockCheckRequest.query).toHaveBeenCalledWith(checkQuery);
      expect(mockUpdateRequest.query).toHaveBeenCalledWith('UPDATE ProfilePic SET img = @profilePic WHERE user_id = @userId');
      expect(result).toBeNull();
    });
  
    it("should handle errors when updating profile picture", async () => {
      const userId = 4;
      const profilePic = "newBase64ImageString";
      const errorMessage = "Database Error";
  
      sql.connect.mockRejectedValue(new Error(errorMessage));
  
      await expect(User.updateProfilePic(userId, profilePic)).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Error updating profile picture:', expect.any(Error));
    });
  });
  


// -------------------------------------------------------------------------------------------------------------------------


describe("User.getProfilePicByUserId", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleError.mockRestore(); // Restore console.error after each test
  });

  it("should retrieve a profile picture by user ID", async () => {
    const userId = 1;
    const mockProfilePic = "base64ImageString";
  
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [{ user_id: userId, img: mockProfilePic }] }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };
  
    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection
  
    const result = await User.getProfilePicByUserId(userId);
  
    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockProfilePic); // Adjust expectation to just the profile picture string
  });
  

  it("should return null if no profile picture is found", async () => {
    const userId = 2;

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }), // No profile picture found
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const result = await User.getProfilePicByUserId(userId);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it("should handle errors when retrieving profile picture", async () => {
    const userId = 3;
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(User.getProfilePicByUserId(userId)).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith('Error retrieving profile picture:', expect.any(Error));
  });
});
