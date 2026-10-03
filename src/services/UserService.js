import bcrypt from 'bcrypt';
import userRepository from '../repositories/UserRepository.js';
import calcAge from '../utils/calcAge.js';
import validatePassword from '../utils/validatePassword.js';

// Datos que se envían al frontend (sin password)
function toDTO(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
        age: calcAge(user.birthdate),
        url_profile: user.url_profile,
        address: user.address,
        roles: user.roles.map(r => r.name),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

class UserService {
    async getAll() {
        const users = await userRepository.getAll();
        return users.map(toDTO);
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return toDTO(user);
    }

    async updateMe(id, data) {
        const allowed = ['name', 'lastName', 'phoneNumber', 'birthdate', 'url_profile', 'address'];
        const changes = {};
        for (const field of allowed) {
            if (data[field] !== undefined) changes[field] = data[field];
        }

        // cambio de password opcional
        if (data.password) {
            validatePassword(data.password);
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);
            changes.password = await bcrypt.hash(data.password, saltRounds);
        }

        const user = await userRepository.updateById(id, changes);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return toDTO(user);
    }
}

export default new UserService();