const UserModel = require('../models/user-model.js')
const {v4} = require('uuid')
const bcrypt = require('bcrypt')
const mailService = require('./mail-service')
const tokenService = require('../service/token-service.js')
const UserDto = require('../dtos/user-dto.js')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if(candidate) {
            throw new Error('User with dat email was created')
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
            throw new Error('ActivationLink is not correct')
        }
        user.isActivated = true
        await user.save()
    }
}

module.exports = new UserService()