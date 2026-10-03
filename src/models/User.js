import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'El password es requerido']
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }],
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true
    },
    birthdate: {
        type: Date,
        required: [true, 'La fecha de nacimiento es requerida'],
        validate: {
            validator: v => v <= new Date(),
            message: 'La fecha de nacimiento no puede ser futura'
        }
    },
    url_profile: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);