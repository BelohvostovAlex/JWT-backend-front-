const UserModel = require('../models/user-model.js')
const {v4} = require('uuid')
const bcrypt = require('bcrypt')
const mailService = require('./mail-service')
const tokenService = require('../service/token-service.js')
const UserDto = require('../dtos/user-dto.js')
const ApiError = require('../exceptions/api-error.js')
const { refresh } = require('../controllers/user-controller.js')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if(candidate) {
            throw ApiError.BadRequest('User with dat email was created')
        }

        const hashPassword = await bcrypt.hash(password,3)
        const activationLink = v4()

        const user = await UserModel.create({email, password: hashPassword})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if(!user) {
            throw ApiError.BadRequest('ActivationLink is not correct')
        }
        user.isActivated = true
        await user.save()
    }
    
    async login(email, password) {
        const user = await UserModel.findOne({email})
        if(!user) {
            throw new ApiError.BadRequest('User with dat email was not found')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals) {
            throw ApiError.BadRequest('Password is not correct')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnAuthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || tokenFromDb) {
            throw ApiError.UnAuthorizedError()
        }

        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find()
        return users
    }
}

module.exports = new UserService()