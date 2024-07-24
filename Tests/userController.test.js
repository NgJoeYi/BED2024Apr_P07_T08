// userController.test.js

const userController = require("../controllers/userController");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock("../models/User"); // Mock the user model
jest.mock("bcryptjs"); // Mock bcrypt
jest.mock("jsonwebtoken"); // Mock jwt


describe("userController.getUserById", () => {
    const req = {
        user: { id: 1 }, // to mock the user property
    }
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
      jest.spyOn(console, 'error').mockImplementation(jest.fn())
    });
  
    it("should fetch a user and return a JSON response", async () => {
      const mockUser = 
          {
            "id": 1,
            "name": "John Doe",
            "dob": "1990-01-01",
            "email": "johndoe@example.com",
            "password": "hashedpassword",
            "role": "student"
          }
  
      // Mock the model function to return the mock data
      User.getUserById.mockResolvedValue(mockUser)
  
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
    };
  
      await userController.getUserById(req, res);
      expect(User.getUserById).toHaveBeenCalledWith(req.user.id); // Check if model was called with correct id
      expect(res.json).toHaveBeenCalledWith(mockUser); // Check the response body
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle cases where user does not exist and return a 404 status with a error message", async () => {
        // Mock the model function to be null
        User.getUserById.mockResolvedValue(null)
    
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        }
        //call function
        await userController.getUserById(req, res);
        //compare status and error message
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith("User does not exist");
      });
  
    it("should handle errors and return a 500 status with error message", async () => {
      const errorMessage = "Database error";
      User.getUserById.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      }

      //call function
      await userController.getUserById(req, res);
      //compare status and error message
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    })
})



// -------------------------------------------------------------------------------------------------------------------------



describe("userController.createUser", () => {
    const req = {
        body: {
            "id": 1,
            "name": "John Doe",
            "dob": "1990-01-01",
            "email": "johndoe@example.com",
            "password": "hashedpassword",
            "role": "student"
          }
    }

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
      jest.spyOn(console, 'error').mockImplementation(jest.fn())
    });
  
    it("should register the user and return a JSON response with status 201", async () => {
        const mockUser = {
            "userId": 1
        };
      //mock bcrypt to return hashed password
      bcrypt.hashSync.mockResolvedValue("hashedpassword")
      User.createUser.mockResolvedValue({ id: 1 });
      jwt.sign.mockReturnValue(mockUser.accessToken);
      
      const res = {
        json: jest.fn(), // Mock the res.json function
        status: jest.fn().mockReturnThis()
      };
            
      const mockGenerateAccessToken = jest.fn().mockReturnValue("jwt token");
      await userController.createUser(req, res, mockGenerateAccessToken);

      expect(res.json).toHaveBeenCalledWith(mockUser); // Check the response body
      expect(res.status).toHaveBeenCalledWith(201)
    })
  
    it("should handle errors and return a 500 status with error message", async () => {
      const errorMessage = "Database error";
      User.createUser.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      }

      //call function
      await userController.createUser(req, res);
      //compare status and error message
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Server error");
    })
})



// -------------------------------------------------------------------------------------------------------------------------



describe("userController.loginUser", () => {
    const req = {
        body: {
            email: "johndoe@example.com",
            password: "hashedpassword"
        }
    };

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock calls before each test
      jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
  
    it("should log in the user and return a JSON response", async () => {
      const mockUser = {
        "id": 1,
        "name": "John Doe",
        "dob": "1990-01-01",
        "email": "johndoe@example.com",
        "password": "hashedpassword",
        "role": "student"
      };
      bcrypt.compare.mockResolvedValue(true);
      User.getUserByEmail.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue("jwt token");
      
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      await userController.loginUser(req, res);
      expect(User.getUserByEmail).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.json).toHaveBeenCalledWith({ token: "jwt token", role: mockUser.role, userId: mockUser.id });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle cases where email is incorrect and return a 404 status with an error message", async () => {
        User.getUserByEmail.mockResolvedValue(null);
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid email. No user found" });
    });
    
    it("should handle cases where password is incorrect and return a 404 status with an error message", async () => {
        const mockUser = {
            "id": 1,
            "name": "John Doe",
            "dob": "1990-01-01",
            "email": "johndoe@example.com",
            "password": "hashedpassword",
            "role": "student"
        };
        User.getUserByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.loginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid password. Please try again" });
    });
  
    it("should handle errors and return a 500 status with an error message", async () => {
      const errorMessage = "Database error";
      User.getUserByEmail.mockRejectedValue(new Error(errorMessage)); // Simulate an error

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await userController.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
});


// -------------------------------------------------------------------------------------------------------------------------
















describe('userController.updateUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update user data and return the updated user', async () => {
        const existingUser = {
            id: 1,
            name: 'John Doe',
            email: 'oldemail@example.com',
            password: 'hashedpassword',
            dob: '1990-01-01'
        };

        // Mock implementations
        User.getUserById.mockResolvedValue(existingUser);
        User.getUserByEmail.mockResolvedValue(null);
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.hash.mockResolvedValue('newhashedpassword');
        User.updateUser.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'johndoe@example.com',
            dob: '1990-01-01',
            password: 'newhashedpassword'
        });

        const req = {
            user: { id: 1 },
            body: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                dob: '1990-01-01',
                currentPassword: 'currentpassword',
                newPassword: 'newpassword'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'johndoe@example.com',
            dob: '1990-01-01',
            password: 'newhashedpassword'
        });
    });

    it('should return 404 if user does not exist', async () => {
        User.getUserById.mockResolvedValue(null);

        const req = {
            user: { id: 1 },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User does not exist' });
    });

    it('should return 400 if email is already in use', async () => {
        const existingUser = {
            id: 1,
            name: 'John Doe',
            email: 'oldemail@example.com',
            password: 'hashedpassword',
            dob: '1990-01-01'
        };

        User.getUserById.mockResolvedValue(existingUser);
        User.getUserByEmail.mockResolvedValue({}); // Simulate existing email

        const req = {
            user: { id: 1 },
            body: {
                email: 'johndoe@example.com'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is already in use' });
    });

    it('should return 400 if current password is incorrect', async () => {
        const existingUser = {
            id: 1,
            name: 'John Doe',
            email: 'oldemail@example.com',
            password: 'hashedpassword',
            dob: '1990-01-01'
        };

        User.getUserById.mockResolvedValue(existingUser);
        User.getUserByEmail.mockResolvedValue(null);
        bcrypt.compare.mockResolvedValue(false); // Simulate incorrect current password

        const req = {
            user: { id: 1 },
            body: {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
    });

    it('should return 400 if current password is not provided', async () => {
        const existingUser = {
            id: 1,
            name: 'John Doe',
            email: 'oldemail@example.com',
            password: 'hashedpassword',
            dob: '1990-01-01'
        };

        User.getUserById.mockResolvedValue(existingUser);
        User.getUserByEmail.mockResolvedValue(null);

        const req = {
            user: { id: 1 },
            body: {
                newPassword: 'newpassword'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Current password is required to set a new password' });
    });

    it('should return 400 if new password is the same as the current password', async () => {
        const existingUser = {
            id: 1,
            name: 'John Doe',
            email: 'oldemail@example.com',
            password: 'hashedpassword',
            dob: '1990-01-01'
        };

        User.getUserById.mockResolvedValue(existingUser);
        User.getUserByEmail.mockResolvedValue(null);
        bcrypt.compare.mockResolvedValue(true);

        const req = {
            user: { id: 1 },
            body: {
                currentPassword: 'currentpassword',
                newPassword: 'currentpassword' // Same as current password
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'New password cannot be the same as the current password' });
    });

    it('should handle server errors gracefully', async () => {
        // Simulate server error by throwing an exception in User.getUserById
        User.getUserById.mockRejectedValue(new Error('Server error'));

        const req = {
            user: { id: 1 },
            body: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
});

















// -------------------------------------------------------------------------------------------------------------------------






// // -------------------------------------------------------------------------------------------------------------------------



// describe("userController.updateProfilePic", () => {
//     const req = {
//         user: {userId: 1},
//         file: {path: "/path/img.png"}

//     }

//     beforeEach(() => {
//       jest.clearAllMocks(); // Clear mock calls before each test
//       jest.spyOn(console, 'error').mockImplementation(jest.fn())
//     });
  
//     it("should update the user's profile picture and return a success message with status 201", async () => {
//       //mock User.getUserById
//       User.getUserById.mockResolvedValue(true)
//       // Mock the model function (null)
//       User.updateProfilePic.mockResolvedValue(null)
      
//       //Mock fs
//       fs.readFileSync.mockResolvedValue(null)
//       fs.unlinkSync.mockResolvedValue(null)

//       const res = {
//         send: jest.fn(), // Mock the res.json function
//         status: jest.fn().mockReturnThis()
//       };
      
//       await userController.updateProfilePic(req, res)

//       expect(res.send).toHaveBeenCalledWith("Profile picture updated successfully"); // Check the response body
//       expect(res.status).toHaveBeenCalledWith(201)
//     })

//     it("should handle case where no file is uploaded and return a error message with status 400", async () => {
//         const reqNoFile = {
//             user: {userId: 1},
    
//         }
  
//         const res = {
//           send: jest.fn(), // Mock the res.json function
//           status: jest.fn().mockReturnThis()
//         };
        
//         await userController.updateProfilePic(reqNoFile, res)
  
//         expect(res.send).toHaveBeenCalledWith("No file uploaded"); // Check the response body
//         expect(res.status).toHaveBeenCalledWith(400)
//     })

//     it("should handle case where user is not found and return a error message with status 404", async () => {
//         //mock User.getUserbyId to return null (no user)
//         User.getUserById.mockResolvedValue(null)
//         const res = {
//           send: jest.fn(), // Mock the res.json function
//           status: jest.fn().mockReturnThis()
//         };
        
//         await userController.updateProfilePic(req, res)
  
//         expect(res.send).toHaveBeenCalledWith("User not found"); // Check the response body
//         expect(res.status).toHaveBeenCalledWith(404)
//     })
  
//     it("should handle errors and return a 500 status with error message", async () => {
//       const errorMessage = "Database error";
//       //mock User.getUserbyId to return true (theres a user)
//       User.getUserById.mockResolvedValue(true)
//       User.updateProfilePic.mockRejectedValue(new Error(errorMessage)); // Simulate an error
        
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         send: jest.fn()
//       }

//       //call function
//       await userController.updateProfilePic(req, res);
//       //compare status and error message
//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.send).toHaveBeenCalledWith("Error updating profile picture");
//     })
// })