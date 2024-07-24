// userController.test.js

const userController = require("../../controllers/userController");
const User = require("../../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock("../../models/User"); // Mock the user model
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



describe('userController.deleteUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if password is not provided', async () => {
        const req = {
            user: { id: 1 },
            body: {} // No password provided
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Please enter your password' });
    });

    it('should return 404 if user does not exist', async () => {
        User.getUserById.mockResolvedValue(null);

        const req = {
            user: { id: 1 },
            body: { password: 'password' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User does not exist' });
    });

    it('should return 400 if password is incorrect', async () => {
        const existingUser = {
            id: 1,
            password: 'hashedpassword'
        };

        User.getUserById.mockResolvedValue(existingUser);
        bcrypt.compare.mockResolvedValue(false); // Password does not match

        const req = {
            user: { id: 1 },
            body: { password: 'wrongpassword' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password is incorrect' });
    });

    it('should return 500 if deleting user-related records fails', async () => {
        const existingUser = {
            id: 1,
            password: 'hashedpassword'
        };

        User.getUserById.mockResolvedValue(existingUser);
        bcrypt.compare.mockResolvedValue(true);
        User.deleteUtility.mockResolvedValue(false); // Simulate failure in deleting user-related records

        const req = {
            user: { id: 1 },
            body: { password: 'correctpassword' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete user-related records' });
    });

    it('should return 500 if deleting user fails', async () => {
        const existingUser = {
            id: 1,
            password: 'hashedpassword'
        };

        User.getUserById.mockResolvedValue(existingUser);
        bcrypt.compare.mockResolvedValue(true);
        User.deleteUtility.mockResolvedValue(true);
        User.deleteUser.mockResolvedValue(false); // Simulate failure in deleting user

        const req = {
            user: { id: 1 },
            body: { password: 'correctpassword' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete user' });
    });

    it('should delete user successfully', async () => {
        const existingUser = {
            id: 1,
            password: 'hashedpassword'
        };

        User.getUserById.mockResolvedValue(existingUser);
        bcrypt.compare.mockResolvedValue(true);
        User.deleteUtility.mockResolvedValue(true);
        User.deleteUser.mockResolvedValue(true);

        const req = {
            user: { id: 1 },
            body: { password: 'correctpassword' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'Account deleted successfully' });
    });

    it('should handle server errors gracefully', async () => {
        User.getUserById.mockRejectedValue(new Error('Server error'));

        const req = {
            user: { id: 1 },
            body: { password: 'password' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: 'Server error' });
    });
});



// -------------------------------------------------------------------------------------------------------------------------

describe('userController.updateProfilePic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update the profile picture and return updated data', async () => {
        const userId = 1;
        const base64ProfilePic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgAAAAASUVORK5CYII=';

        // Mock User.updateProfilePic implementation
        User.updateProfilePic = jest.fn().mockResolvedValue({ userId, profilePic: base64ProfilePic });

        const req = {
            user: { id: userId },
            body: { profilePic: base64ProfilePic }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await userController.updateProfilePic(req, res);

        expect(User.updateProfilePic).toHaveBeenCalledWith(userId, base64ProfilePic);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ userId, profilePic: base64ProfilePic });
    });

    it('should return 400 if the update fails', async () => {
        const userId = 1;
        const base64ProfilePic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgAAAAASUVORK5CYII=';

        // Mock User.updateProfilePic to return null to simulate failure
        User.updateProfilePic = jest.fn().mockResolvedValue(null);

        const req = {
            user: { id: userId },
            body: { profilePic: base64ProfilePic }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await userController.updateProfilePic(req, res);

        expect(User.updateProfilePic).toHaveBeenCalledWith(userId, base64ProfilePic);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Failed to update profile picture');
    });

    it('should handle server errors', async () => {
        const userId = 1;
        const base64ProfilePic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgAAAAASUVORK5CYII=';

        // Mock User.updateProfilePic to throw an error
        User.updateProfilePic = jest.fn().mockRejectedValue(new Error('Database error'));

        const req = {
            user: { id: userId },
            body: { profilePic: base64ProfilePic }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await userController.updateProfilePic(req, res);

        expect(User.updateProfilePic).toHaveBeenCalledWith(userId, base64ProfilePic);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server error');
    });
});



// -------------------------------------------------------------------------------------------------------------------------


describe('userController.getProfilePicByUserId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the profile picture if it exists', async () => {
        const userId = 1;
        const base64ProfilePic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgAAAAASUVORK5CYII=';

        // Mock User.getUserById and User.getProfilePicByUserId implementations
        User.getUserById = jest.fn().mockResolvedValue({ id: userId });
        User.getProfilePicByUserId = jest.fn().mockResolvedValue(base64ProfilePic);

        const req = {
            user: { id: userId }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await userController.getProfilePicByUserId(req, res);

        expect(User.getUserById).toHaveBeenCalledWith(userId);
        expect(User.getProfilePicByUserId).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ profilePic: base64ProfilePic });
    });

    it('should return default profile picture if no profile picture is found', async () => {
        const userId = 1;
        const defaultProfilePic = 'images/profilePic.jpeg';

        // Mock User.getUserById and User.getProfilePicByUserId implementations
        User.getUserById = jest.fn().mockResolvedValue({ id: userId });
        User.getProfilePicByUserId = jest.fn().mockResolvedValue(null);

        const req = {
            user: { id: userId }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await userController.getProfilePicByUserId(req, res);

        expect(User.getUserById).toHaveBeenCalledWith(userId);
        expect(User.getProfilePicByUserId).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ profilePic: defaultProfilePic });
    });

    it('should return 404 if user does not exist', async () => {
        const userId = 1;

        // Mock User.getUserById to return null
        User.getUserById = jest.fn().mockResolvedValue(null);

        const req = {
            user: { id: userId }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await userController.getProfilePicByUserId(req, res);

        expect(User.getUserById).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('User does not exist');
    });

    it('should handle server errors', async () => {
        const userId = 1;

        // Mock User.getUserById to throw an error
        User.getUserById = jest.fn().mockRejectedValue(new Error('Database error'));

        const req = {
            user: { id: userId }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        await userController.getProfilePicByUserId(req, res);

        expect(User.getUserById).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Server error');
    });
});
