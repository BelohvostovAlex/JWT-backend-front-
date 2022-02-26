const userService = require('../service/user-service')

class UserController {
    async registration(req,res,nex) {
        try {
            const {email, password} = req.body
            const userData = await userService.registration(email,password)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 100, httpOnly: true})

            return res.json(userData)
        } catch (error) {
            console.log(error)
        }
    }

    async login(req,res,nex) {
        try {
            
        } catch (error) {
            
        }
    }

    async logout(req,res,nex) {
        try {
            
        } catch (error) {
            
        }
    }

    async activate(req,res,nex) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (error) {
            console.log(error)
        }
    }

    async refresh(req,res,nex) {
        try {
            
        } catch (error) {
            
        }
    }

    async getUsers(req,res,nex) {
        try {
            res.json({user:'alex', pass: 123})
        } catch (error) {
            
        }
    }
}

module.exports = new UserController()