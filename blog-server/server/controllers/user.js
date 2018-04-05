const User = require('../models/user')
const crypto = require('crypto')

class UserController {
  async findAll (ctx) {
    ctx.body = await User.find()
  }

  async signUp (ctx) {
    const _user = ctx.request.body
    const user = await User.findOne({username: _user.username}).exec()
    if (user) {
      ctx.throw({message: '该用户名已存在'})
    } else {
      await new User(_user).save()
      ctx.body = {
        message: '注册成功'
      }
    }
  }

  async signIn (ctx) {
    const _user = ctx.request.body
    const user = await User.findOne({username: _user.username}).exec()
    if (user) {
      let derivedKey = crypto.pbkdf2Sync(_user.password, user.salt, 100, 64, 'sha512')
      if (user.password === derivedKey.toString('hex')) {
        ctx.session.user = user
        ctx.body = {
          user
        }
      } else {
        ctx.throw({message: '账号或密码错误'})
      }
    } else {
      ctx.throw({message: '账户不存在'})
    }
  }

  async getProfile (ctx) {
    if (!ctx.session.user) {
      ctx.throw({message: '请先登录'})
    }
    const {
      nick_name,
      bio,
      github,
      weibo,
      email
    } = ctx.session.user
    ctx.body = {
      nick_name,
      bio,
      github,
      weibo,
      email
    }
  }

  async updateProfile (ctx) {
    if (!ctx.session.user) {
      ctx.throw({message: '请先登录'})
    }
    const user = ctx.session.user
    const data = ctx.request.body
    const userUpdated = Object.assign({}, user, data)
    try {
      await User.findByIdAndUpdate(user._id, userUpdated)
      ctx.body = {
        message: '修改成功'
      }
    } catch (e) {
      ctx.throw(e)
    }
  }
}

module.exports = new UserController()
